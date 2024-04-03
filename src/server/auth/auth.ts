import FusionAuthClient, { JWT } from '@fusionauth/typescript-client';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { JwtHeader, verify } from 'jsonwebtoken';
import jwksClient, { RsaSigningKey } from 'jwks-rsa';
import pkceChallenge from 'pkce-challenge';
import { log } from '../../util/logger';
import config from '../../config/config';

dotenv.config();

export const setupSession = async (res: Response) => {
  const stateValue = Array(6)
    .fill(Math.random().toString(36).substring(2, 15))
    .reduce((acc, next) => (acc += next));
  const pkcePair = await pkceChallenge();
  res.cookie(
    config.userSession,
    {
      stateValue,
      verifier: pkcePair.code_verifier,
      challenge: pkcePair.code_challenge,
    },
    { httpOnly: true },
  );
};

export const resetSession = (res: Response) => {
  log.info('Logging out...');
  res.clearCookie(config.userSession);
  res.clearCookie(config.userToken);
  res.clearCookie(config.userDetails);
};

const getKey = async (header: JwtHeader, callback: Function) => {
  const jwks = jwksClient({
    jwksUri: `${config.fusionAuthURL}/.well-known/jwks.json`,
  });
  const key = (await jwks.getSigningKey(header.kid)) as RsaSigningKey;
  var signingKey = key?.getPublicKey() || key?.rsaPublicKey;
  callback(null, signingKey);
};

export const validateUser = async (userTokenCookie: JWT) => {
  // Make sure the user is authenticated.
  if (!userTokenCookie || !userTokenCookie?.access_token) {
    return false;
  }
  try {
    let decodedFromJwt;
    await verify(
      userTokenCookie.access_token,
      await getKey,
      undefined,
      (err, decoded) => {
        decodedFromJwt = decoded;
      },
    );
    return decodedFromJwt;
  } catch (err) {
    if (err instanceof Error) log.error(err.message);
    return false;
  }
};

const client = new FusionAuthClient('', config.fusionAuthURL!);
export const populateCredentialCookies = async (
  req: Request,
  res: Response,
) => {
  const stateFromFusionAuth = `${req.query?.state}`;
  const authCode = `${req.query?.code}`;

  const userSessionCookie = req.cookies[config.userSession];
  if (stateFromFusionAuth !== userSessionCookie?.stateValue) {
    throw new Error(
      "State doesn't match. Saw: " +
        stateFromFusionAuth +
        ', but expected: ' +
        userSessionCookie?.stateValue,
    );
  }

  // Exchange Auth Code and Verifier for Access Token
  const accessToken = (
    await client.exchangeOAuthCodeForAccessTokenUsingPKCE(
      authCode,
      config.clientId!,
      config.clientSecret!,
      `${config.appUrl}/oauth-redirect`,
      userSessionCookie.verifier,
    )
  ).response;

  if (!accessToken.access_token) {
    throw new Error('Failed to get Access Token');
  }

  res.cookie(config.userToken, accessToken, { httpOnly: true });

  const userResponse = (
    await client.retrieveUserUsingJWT(accessToken.access_token)
  ).response;
  if (!userResponse?.user) {
    throw new Error('Failed to get User from access token, redirecting home.');
  }

  res.cookie(config.userDetails, userResponse.user);
};
