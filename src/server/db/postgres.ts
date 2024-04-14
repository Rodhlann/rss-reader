import { Client } from 'pg';
import config from '../../config/config';
import { log } from '../../util/logger';
import { DBFeed, Datasource } from './datasource';

export class PostgresDatasource implements Datasource {
  private db: Client;

  constructor() {
    const pgConfig = config.postgres as Record<string, string | number>;
    const missing = Object.keys(pgConfig).filter((key) => !pgConfig[key]);
    if (missing.length) {
      throw new Error(
        `Unable to initialize Postgres due to missing var(s): [${missing.join(', ')}]`,
      );
    }

    this.db = new Client(config.postgres);
    this.db
      .connect()
      .then(() => {
        this.db
          .query(
            `CREATE TABLE IF NOT EXISTS rss_feeds (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL UNIQUE,
          url TEXT NOT NULL UNIQUE,
          category ENUM('code', 'tech', 'ocean') NOT NULL
        )`,
          )
          .then(() => {
            log.info('Postgres DB initialized');
          })
          .catch((e: Error) => {
            log.error('DB initialization failed', e.message);
            throw e;
          });
      })
      .catch((e: Error) => {
        log.error('DB initialization failed', e.message);
        throw e;
      });
  }

  add = async ({ title, url, category }: DBFeed): Promise<void> => {
    await this.db.query(`INSERT INTO rss_feeds (title, url, category) VALUES ($1, $2, $3)`, [
      title,
      url,
      category
    ]);
  };

  getAll = async (): Promise<DBFeed[]> => {
    const { rows } = await this.db.query<DBFeed>('SELECT * FROM rss_feeds');
    return rows;
  };

  deleteByTitle = async ({
    title,
  }: {
    title: DBFeed['title'];
  }): Promise<void> => {
    await this.db.query(`DELETE FROM rss_feeds where title=$1`, [title]);
  };
}
