import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import { initializeDB } from './server/db/db';
import { registerRoutes } from './server/routes';
import { log } from './util/logger';
import config from './config/config';

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());

app.use(express.static(path.join(__dirname, '/public')));

initializeDB();
registerRoutes(app);

app.listen(config.port, () => {
  return log.info(`Express is listening at port: ${config.port}`);
});
