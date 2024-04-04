import { Express } from 'express'
import { setupSession } from '../auth/auth';
import { Home } from '../template/home';
import { fetchFeeds } from '../service/feedService';

export const registerPublicRoutes = (app: Express): void => {
  app.get('/rss-feeds', async (_req, res) => {
    await setupSession(res);
    res.send(Home());
  });
  
  app.get('/feeds', async (_req, res) => {
    const feeds = await fetchFeeds();
    res.json(feeds);
  });
}