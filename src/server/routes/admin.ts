import { Express } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'path';
import { log } from '../../util/logger';
import { validateUser } from '../auth/auth';
import { DBFeed } from '../db/db';
import { addFeed, deleteFeed, getDBFeeds } from '../service/feedService';
import { Admin } from '../template/admin';
import config from '../../config/config';

const upload = multer({ dest: 'uploads/' });

export const registerAdminRoutes = (app: Express): void => {
  app.get('/feeds/export', async (req, res) => {
    const userTokenCookie = req.cookies ? req.cookies[config.userToken] : '';
    const isValid = await validateUser(userTokenCookie);
    if (!isValid) {
      log.warn('UNAUTHORIZED: Attempt to perform admin task failed');
      res.redirect(302, '/');
      return;
    }

    try {
      log.info('Processing DB feeds for export');
      const feeds = await getDBFeeds();

      // Define the file name and path
      const fileName = 'export-feeds.txt';
      const filePath = path.join(__dirname, fileName);

      log.info('Writing feeds to export file');
      // Write the text string to the file
      fs.writeFileSync(filePath, JSON.stringify(feeds));

      // Set the appropriate response headers for file download
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.setHeader('Content-Type', 'text/plain');

      log.info('Resolving feeds export file');
      // Send the file to the client
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      log.info('Deleting feeds export file');
      // Remove the file after it's been sent
      fileStream.on('close', () => {
        fs.unlinkSync(filePath);
      });
    } catch (e) {
      if (e instanceof Error)
        log.error('Export Failed', { errorMessage: e.message });
    }
  });

  app.post('/feeds/import', upload.single('file'), async (req, res) => {
    const userTokenCookie = req.cookies ? req.cookies[config.userToken] : '';
    const isValid = await validateUser(userTokenCookie);
    if (!isValid) {
      log.warn('UNAUTHORIZED: Attempt to perform admin task failed');
      res.redirect(302, '/');
      return;
    }

    try {
      log.info('Processing feeds import file');

      const file = req?.file;
      if (!file) throw new Error('No file uploaded');

      const data = fs.readFileSync(file.path, 'utf-8');
      const feeds = JSON.parse(data) as DBFeed[];

      log.info('Storing feeds', { count: feeds.length });
      for (const feed of feeds) {
        await addFeed(feed);
      }

      log.info('Deleting temp feeds import file');
      fs.rmSync(file.path);
    } catch (e) {
      if (e instanceof Error)
        log.error('Import Failed', { errorMessage: e.message });
    } finally {
      res.redirect(302, '/admin');
      return;
    }
  });

  app.get('/admin', async (req, res) => {
    const userTokenCookie = req.cookies ? req.cookies[config.userToken] : '';
    const isValid = await validateUser(userTokenCookie);
    if (!isValid) {
      log.warn('UNAUTHORIZED: Attempt to reach admin page failed');
      res.redirect(302, '/');
      return;
    }
    res.send(await Admin());
  });

  app.post('/admin', async (req, res) => {
    const userTokenCookie = req.cookies ? req.cookies[config.userToken] : '';
    const isValid = await validateUser(userTokenCookie);
    if (!isValid) {
      log.warn('UNAUTHORIZED: Attempt to add feed failed');
      res.redirect(302, '/');
      return;
    }
    const { title, link } = req.body;
    await addFeed({ title, url: link });
    res.send(await Admin());
  });

  app.post('/delete', async (req, res) => {
    const userTokenCookie = req.cookies ? req.cookies[config.userToken] : '';
    const isValid = await validateUser(userTokenCookie);
    if (!isValid) {
      log.warn('UNAUTHORIZED: Attempt to delete feed failed');
      res.redirect(302, '/');
      return;
    }
    const { title } = req.body;
    deleteFeed({ title });
    res.redirect(302, '/admin');
  });
};
