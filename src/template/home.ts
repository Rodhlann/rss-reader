import { getAll } from '../db/db';

export const Home = async (): Promise<string> => {
  const feeds = await getAll();
  const renderedFeeds =
    feeds
      .map(({ title, url }) => `<li><a href="${url}">${title}</a></li>`)
      .join('\n') || '<li>No feeds found</li>';

  return `<html>
  <h1>My Cool RSS Feeds</h1>
  <a href="http://localhost:3000/login">Admin Login</a>

  <h2>Feeds</h2>
  <ul>
  ${renderedFeeds}
  </ul>

  </html>`;
};
