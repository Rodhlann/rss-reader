import path from 'node:path';
import { log } from '../../util/logger';
import { DBFeed, Datasource } from './datasource';

export class SqliteDatasource implements Datasource {
  private db;

  constructor() {
    const sqlite3 = require('sqlite3').verbose();

    this.db = new sqlite3.Database(
      path.resolve(__dirname, 'feeds.db'),
      (err: Error) => {
        if (err) throw err;
      },
    );

    this.db.run(
      `CREATE TABLE IF NOT EXISTS rss_feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL UNIQUE
    )`,
      (err: Error) => {
        if (err) {
          log.error('DB initialization failed', err.message);
          throw err;
        } else {
          log.info('Sqlite DB initialized');
        }
      },
    );
  }

  add = async ({ title, url }: DBFeed): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO rss_feeds (title, url) VALUES (?, ?)`,
        [title, url],
        async (err: Error) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  };

  getAll = async (): Promise<DBFeed[]> => {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM rss_feeds', (err: Error, rows: DBFeed[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  };

  deleteByTitle = async ({
    title,
  }: {
    title: DBFeed['title'];
  }): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM rss_feeds where title=?`,
        [title],
        async (err: Error) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  };
}
