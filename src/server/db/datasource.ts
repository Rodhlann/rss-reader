import config from '../../config/config';
import { log } from '../../util/logger';
import { cacheReset } from './cache';
import { PostgresDatasource } from './postgres';
import { SqliteDatasource } from './sqlite';

export type DBFeed = { title: string; url: string };

export interface Datasource {
  add({ title, url }: DBFeed): Promise<void>;
  getAll(): Promise<DBFeed[]>;
  deleteByTitle({ title }: { title: DBFeed['title'] }): Promise<void>;
}

class SQLDatasource implements Datasource {
  private client: Datasource;

  constructor() {
    switch (config.dbms) {
      case 'POSTGRES':
        this.client = new PostgresDatasource();
        break;
      case 'SQLITE':
      default:
        this.client = new SqliteDatasource();
    }
  }

  add = async ({ title, url }: DBFeed): Promise<void> => {
    try {
      await this.client.add({ title, url });
      log.info('Feed added:', title);
      await cacheReset();
    } catch (e) {
      if (e instanceof Error)
        log.error('Unable to add feed', {
          errorMessage: e instanceof Error ? e.message : JSON.stringify(e),
        });
      throw e
    }
  };

  getAll = async (): Promise<DBFeed[]> => {
    try {
      return await this.client.getAll();
    } catch (e) {
      if (e instanceof Error)
        log.error('Unable to retrieve feeds', {
          errorMessage: e instanceof Error ? e.message : JSON.stringify(e),
        });
      return [];
    }
  };

  deleteByTitle = async ({
    title,
  }: {
    title: DBFeed['title'];
  }): Promise<void> => {
    try {
      await this.client.deleteByTitle({ title });
      log.info('Feed deleted:', title);
      await cacheReset();
    } catch (e) {
      if (e instanceof Error)
        log.error('Unable to delete feed', {
          errorMessage: e instanceof Error ? e.message : JSON.stringify(e),
        });
    }
  };
}

export const datasource = new SQLDatasource();
