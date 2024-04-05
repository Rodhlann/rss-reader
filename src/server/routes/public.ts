import { Express } from 'express'
import { Home } from '../template/home';
import { fetchFeeds } from '../service/feedService';

export const registerPublicRoutes = (app: Express): void => {
  app.get('/', async (_req, res) => {
    res.send(Home());
  });
  
  app.get('/feeds', async (_req, res) => {
    const feeds = await fetchFeeds();
    res.json(feeds);
  });
}