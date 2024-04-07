import { Express } from 'express';
import { requiresAuth } from 'express-openid-connect';
import multer from 'multer';
import fs from 'node:fs';
import path from 'path';
import { log } from '../../util/logger';
import { DBFeed } from '../db/datasource';
import { addFeed, deleteFeed, getDBFeeds } from '../service/feedService';
import { Admin } from '../template/admin';

const upload = multer({ dest: 'uploads/' });

export const registerAdminRoutes = (app: Express): void => {
  app.get('/feeds/export', requiresAuth(), async (_req, res) => {
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

  app.post(
    '/feeds/import',
    requiresAuth(),
    upload.single('file'),
    async (req, res) => {
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
        res.redirect(302, '/admin');
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown Error';
        log.error('Import Failed', { errorMessage: message });
        res.status(500).send(`Unable to import feeds: ${message}`);
      }
    },
  );

  app.get('/admin', requiresAuth(), async (req, res) => {
    res.send(await Admin());
  });

  app.post('/admin', requiresAuth(), async (req, res) => {
    const { title, link } = req.body;
    try {
      await addFeed({ title, url: link });
      res.send(await Admin());
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown Error';
      res.status(500).send(`Unable to add feed: ${message}`);
    }
  });

  app.post('/delete', requiresAuth(), async (req, res) => {
    const { title } = req.body;
    deleteFeed({ title });
    res.redirect(302, '/admin');
  });
};
