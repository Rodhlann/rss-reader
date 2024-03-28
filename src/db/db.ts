import { log } from '../util/logger';
import path from 'node:path';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.resolve(__dirname, 'feeds.db'), (err) => {
  if (err) log.error(err.message)
});

export type Feed = { title: string; url: string };

export const initializeDB = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS rss_feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL UNIQUE
    )`,
      (err) => {
        if (err) {
          log.error('DB initialization failed', err.message);
          reject(err);
        } else {
          log.info('DB initialized');
          resolve();
        }
      },
    );
  });
};

export const add = async ({ title, url }: Feed): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO rss_feeds (title, url) VALUES (?, ?)`,
      [title, url],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    );
  });
};

export const getAll = async (): Promise<Feed[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM rss_feeds', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const deleteByTitle = async ({
  title,
}: {
  title: Feed['title'];
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.all(`DELETE FROM rss_feeds where title="${title}"`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
