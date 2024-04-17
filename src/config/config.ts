import dotenv from 'dotenv';
dotenv.config();

type Environment = 'production' | 'development';
const nodeEnv: Environment =
  (process.env.NODE_ENV as Environment) || 'development';

const dbms: 'POSTGRES' | 'SQLITE' =
  nodeEnv === 'production' ? 'POSTGRES' : 'SQLITE';

const postgresHost = process.env.POSTGRES_HOST || 'localhost';
const postgresPassword = process.env.POSTGRES_PASSWORD;
const postgresUser = process.env.POSTGRES_USER;
const postgresDb = process.env.POSTGRES_DB;
const postgresPort = process.env.POSTGRES_PORT || '5432';

const isLocal = process.env.BASE_URL === 'http://localhost';
const baseURL = process.env.BASE_URL + (isLocal ? ':' + process.env.PORT : '');
const port = process.env.PORT;
const secret = process.env.SECRET;
const clientID = process.env.CLIENT_ID;
const issuerBaseURL = process.env.ISSUER_URL;

export default {
  port,
  feedFetchRetryCount: 5,
  dbms,
  auth: {
    authRequired: false,
    auth0Logout: true,
    secret,
    baseURL,
    clientID,
    issuerBaseURL,
  },
  postgres: {
    host: postgresHost,
    password: postgresPassword,
    user: postgresUser,
    database: postgresDb,
    port: parseInt(postgresPort),
  },
};
