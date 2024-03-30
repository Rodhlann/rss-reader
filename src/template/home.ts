import { getAll } from '../db/db';
import { Feeds } from './feeds';

export const Home = async (): Promise<string> => {
  const feeds = await getAll();

  return `<html>
  <body>
  <head>
    <link rel="stylesheet" type="text/css" href="css/home.css">
    <link rel="stylesheet" type="text/css" href="css/feeds.css">
  </head>

  <div class="content-wrapper">
    <h1>My Cool RSS Feeds</h1>
    <a href="http://localhost:3000/login">Admin Login</a>

    <h2>This Week's Feeds</h2>

    ${await Feeds(feeds, false)}
  </div>
  </body>
  </html>`;
};
