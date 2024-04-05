import dotenv from 'dotenv';
dotenv.config();

const isLocal = process.env.BASE_URL === 'http://localhost'
const baseURL = process.env.BASE_URL + (isLocal ? ':' + process.env.PORT : '');
const port = process.env.PORT;
const secret = process.env.SECRET;
const clientID = process.env.CLIENT_ID;
const issuerBaseURL = process.env.ISSUER_URL;

export default {
  port,
  auth: {
    authRequired: false,
    auth0Logout: true,
    secret,
    baseURL,
    clientID,
    issuerBaseURL,
  },
};
