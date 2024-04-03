import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { initializeDB } from './server/db/db';
import { registerRoutes } from './server/routes';
import { log } from './util/logger';

dotenv.config();

const port = process.env.port;

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());

app.use(express.static(path.join(__dirname, '/public')));

initializeDB();
registerRoutes(app);

app.listen(port, () => {
  return log.info(`Express is listening at http://localhost:${port}`);
});
