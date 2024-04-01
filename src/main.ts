import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import {
  populateCredentialCookies,
  resetSession,
  setupSession,
  validateUser,
} from './server/auth/auth';
import { initializeDB } from './server/db/db';
import { addFeed, deleteFeed, fetchFeeds } from './server/service/feedService';
import { Admin } from './server/template/admin';
import { Home } from './server/template/home';
import { userSession, userToken } from './util/constants';
import { log } from './util/logger';

dotenv.config();

const clientId = process.env.clientId;
const fusionAuthURL = process.env.fusionAuthURL;
const port = process.env.port;

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());

app.use(express.static(path.join(__dirname, '/public')));

initializeDB();

app.get('/', async (_req, res) => {
  await setupSession(res);
  res.send(await Home());
});

app.get('/feeds', async (_req, res) => {
  const feeds = await fetchFeeds();
  res.json(feeds);
});

app.get('/admin', async (req, res) => {
  const userTokenCookie = req.cookies ? req.cookies[userToken] : '';
  const isValid = await validateUser(userTokenCookie);
  if (!isValid) {
    log.warn('UNAUTHORIZED: Attempt to reach admin page failed');
    res.redirect(302, '/');
    return;
  }
  res.send(await Admin());
});

app.post('/admin', async (req, res) => {
  const userTokenCookie = req.cookies ? req.cookies[userToken] : '';
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
  const userTokenCookie = req.cookies ? req.cookies[userToken] : '';
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

app.get('/login', async (req, res) => {
  const userSessionCookie = req.cookies[userSession];
  // Cookie was cleared, just send back (hacky way)
  if (!userSessionCookie?.stateValue || !userSessionCookie?.challenge) {
    res.redirect(302, '/');
    return;
  }
  res.redirect(
    302,
    `${fusionAuthURL}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:${port}/oauth-redirect&state=${userSessionCookie?.stateValue}&code_challenge=${userSessionCookie?.challenge}&code_challenge_method=S256`,
  );
});

app.get('/oauth-redirect', async (req, res) => {
  try {
    await populateCredentialCookies(req, res);
    log.info('Login successful');
    res.redirect(302, '/admin');
  } catch (err: any) {
    log.error(err);
    res.status(err?.statusCode || 500).json(
      JSON.stringify({
        error: err,
      }),
    );
    res.redirect(302, '/');
  }
});

app.get('/logout', (_req, res) => {
  res.redirect(302, `${fusionAuthURL}/oauth2/logout?client_id=${clientId}`);
});

app.get('/oauth2/logout', (_req, res) => {
  resetSession(res);
  log.info('Logout successful');
  res.redirect(302, '/');
});

app.listen(port, () => {
  return log.info(`Express is listening at http://localhost:${port}`);
});
