import path from 'node:path';
import { log } from '../../util/logger';
import { Feed } from '../../util/types';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(
  path.resolve(__dirname, 'feeds.db'),
  (err: Error) => {
    if (err) log.error(err.message);
  },
);
const cache = new sqlite3.Database(':memory:', (err: Error) => {
  if (err) log.error(err.message);
});

export type DBFeed = { title: string; url: string };

export const initializeDB = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS rss_feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL UNIQUE
    )`,
      (err: Error) => {
        if (err) {
          log.error('DB initialization failed', err.message);
          reject(err);
        } else {
          log.info('DB initialized');
          resolve();
        }
      },
    );

    cache.run(
      `CREATE TABLE cache (
          blob BLOB NOT NULL,
          created_at DATETIME DEFAULT (datetime('now','localtime'))
        )`,
      (err: Error) => {
        if (err) {
          log.error('Cache initialization failed', err.message);
          reject(err);
        } else {
          log.info('Cache initialized');
          resolve();
        }
      },
    );
  });
};

export const add = async ({ title, url }: DBFeed): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO rss_feeds (title, url) VALUES (?, ?)`,
      [title, url],
      async (err: Error) => {
        if (err) {
          reject(err);
        } else {
          log.info('Feed added:', title);
          await cacheReset();
          resolve();
        }
      },
    );
  });
};

export const getAll = async (): Promise<DBFeed[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM rss_feeds', (err: Error, rows: DBFeed[]) => {
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
  title: DBFeed['title'];
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.all(
      `DELETE FROM rss_feeds where title="${title}"`,
      async (err: Error) => {
        if (err) {
          reject(err);
        } else {
          log.info('Feed deleted:', title);
          await cacheReset();
          resolve();
        }
      },
    );
  });
};

const cacheReset = async (): Promise<void> => {
  log.info('Resetting cache');
  return new Promise((resolve, reject) => {
    cache.run('DELETE FROM cache', (err: Error) => {
      if (err) {
        log.error('Failed to reset cache', { errorMessage: err.message });
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const cacheFeeds = (feeds: Feed[]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    await cacheReset();
    log.info('Caching feeds');
    cache.run(
      `INSERT INTO cache (blob) VALUES (?)`,
      [JSON.stringify(feeds)],
      (err: Error) => {
        if (err) {
          log.error('Failed to cache feeds', { errorMessage: err.message });
          reject(err);
        } else {
          resolve();
        }
      },
    );
  });
};

const cacheTimeoutMinutes = 10;
const cacheTimeout = cacheTimeoutMinutes * 60 * 1000;
type Cache = {
  blob: string;
  created_at: string;
};
export const getCachedFeeds = (): Promise<Feed[] | null> => {
  log.info('Checking for cached feeds');
  return new Promise((resolve, reject) => {
    cache.all(
      'SELECT * FROM cache LIMIT 1',
      async (err: Error, rows: Cache[]) => {
        if (err) {
          log.error('Failed to retrieve cached feeds', {
            errorMessage: err.message,
          });
          reject(err);
        } else {
          const { blob, created_at } = rows[0] || {};
          const created = new Date(created_at).getTime();
          const cacheTime = new Date(
            new Date().getTime() - cacheTimeout,
          ).getTime();
          if (created < cacheTime) {
            log.warn('!! CACHE RESET !!');
            await cacheReset();
            resolve([]);
          }
          resolve(blob ? JSON.parse(blob) : null);
        }
      },
    );
  });
};
