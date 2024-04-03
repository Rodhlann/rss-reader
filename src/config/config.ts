import dotenv from 'dotenv';
dotenv.config();

const userSession = 'userSession';
const userToken = 'userToken';
const userDetails = 'userDetails'; //Non Http-Only with user info (not trusted)

const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const fusionAuthURL = process.env.fusionAuthURL;
const port = process.env.port;
const appUrl = process.env.appUrl || 'http://localhost' + port;

export default {
  clientId,
  clientSecret,
  fusionAuthURL,
  port,
  appUrl,
  userSession,
  userToken,
  userDetails
};
