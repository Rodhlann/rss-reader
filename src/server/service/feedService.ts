import { NormalizerFactory } from '../../util/feedNormalizer';
import { log } from '../../util/logger';
import { Feed } from '../../util/types';
import { validateText, validateUrl } from '../../util/validate';
import { cacheFeeds, getCachedFeeds } from '../db/cache';
import { DBFeed, datasource } from '../db/datasource';

export const fetchFeeds = async (): Promise<Feed[]> => {
  const cachedFeeds = await getCachedFeeds();
  if (cachedFeeds?.length) {
    log.info('Resolving cached feeds');
    return cachedFeeds;
  }
  log.info('No cached feeds found');

  log.info('Fetching feed data');
  const feeds = await datasource.getAll();

  const promises = feeds.map(({ url }) => fetch(url));
  const resolved = await Promise.all(promises);

  const parsedFeeds = (
    await Promise.all(
      resolved.map(async (res, idx) => {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        if (!reader) return;
        let xmlString = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            // Process the value (Uint8Array) read from the stream
            xmlString += decoder.decode(value);
          }
        } catch (e) {
          if (e instanceof Error) log.error(e.message);
        } finally {
          reader.releaseLock();
        }

        const normalizer = new NormalizerFactory(xmlString);
        return normalizer.normalize(feeds[idx].title);
      }),
    )
  ).filter(Boolean) as Feed[];

  cacheFeeds(parsedFeeds);
  return parsedFeeds;
};

export const getDBFeeds = async (): Promise<DBFeed[]> => {
  log.info('Fetching feed data');
  return await datasource.getAll();
};

export const addFeed = async ({ title, url, category }: DBFeed) => {
  log.info('Adding feed:', title);
  const trimmedTitle = title.trim();
  const trimmedUrl = url.trim();

  if (!validateText(trimmedTitle)) {
    const error = 'Invalid title string provided'
    log.error(error)
    throw new Error(error);
  }
  if (!validateUrl(trimmedUrl)) {
    const error = 'Invalid URL string provided'
    log.error(error);
    throw new Error(error);
  }

  await datasource.add({ title: trimmedTitle, url: trimmedUrl, category });
};

export const deleteFeed = async ({ title }: Pick<DBFeed, 'title'>) => {
  log.info('Deleting feed:', title);
  if (!validateText(title)) {
    log.error('Invalid title string provided');
    return;
  }
  try {
    await datasource.deleteByTitle({ title });
  } catch (e) {
    if (e instanceof Error)
      log.error('Unable to delete feed', { errorMessage: e.message });
    return;
  }
};
