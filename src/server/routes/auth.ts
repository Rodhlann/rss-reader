import { Express } from 'express';
import config from '../../config/config';
import { log } from '../../util/logger';
import { populateCredentialCookies, resetSession } from '../auth/auth';

export const registerAuthRoutes = (app: Express): void => {
  app.get('/login', async (req, res) => {
    const userSessionCookie = req.cookies[config.userSession];
    // Cookie was cleared, just send back (hacky way)
    if (!userSessionCookie?.stateValue || !userSessionCookie?.challenge) {
      res.redirect(302, '/');
      return;
    }
    res.redirect(
      302,
      `${config.fusionAuthURL}/oauth2/authorize?client_id=${config.clientId}&response_type=code&redirect_uri=${config.appUrl}/oauth-redirect&state=${userSessionCookie?.stateValue}&code_challenge=${userSessionCookie?.challenge}&code_challenge_method=S256`,
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
    res.redirect(
      302,
      `${config.fusionAuthURL}/oauth2/logout?client_id=${config.clientId}`,
    );
  });

  app.get('/oauth2/logout', (_req, res) => {
    resetSession(res);
    log.info('Logout successful');
    res.redirect(302, '/');
  });
};
