import { NormalizerFactory } from '../../util/feedNormalizer';
import { log } from '../../util/logger';
import { Feed } from '../../util/types';
import { validateText, validateUrl } from '../../util/validate';
import {
  DBFeed,
  add,
  cacheFeeds,
  deleteByTitle,
  getAll,
  getCachedFeeds,
} from '../db/db';

export const fetchFeeds = async (): Promise<Feed[]> => {
  const cachedFeeds = await getCachedFeeds();
  if (cachedFeeds?.length) {
    log.info('Resolving cached feeds');
    return cachedFeeds;
  }
  log.info('No cached feeds found');

  log.info('Fetching feed data');
  const feeds = await getAll();

  const promises = feeds.map(({ url }) => fetch(url));
  const resolved = await Promise.all(promises);

  const parsedFeeds = (
    await Promise.all(
      resolved.map(async (res) => {
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
        return normalizer.normalize();
      }),
    )
  ).filter(Boolean) as Feed[];

  cacheFeeds(parsedFeeds);
  return parsedFeeds;
};

export const addFeed = async ({ title, url }: DBFeed) => {
  log.info('Adding feed:', title);
  const trimmedTitle = title.trim();
  const trimmedUrl = url.trim();
  if (!validateText(trimmedTitle)) {
    log.error('Invalid title string provided');
    return;
  }
  if (!validateUrl(trimmedUrl)) {
    log.error('Invalid URL string provided');
    return;
  }
  try {
    await add({ title: trimmedTitle, url: trimmedUrl });
  } catch (e) {
    if (e instanceof Error)
      log.error('Unable to add feed', { errorMessage: e.message });
    return;
  }
};

export const deleteFeed = async ({ title }: Omit<DBFeed, 'url'>) => {
  log.info('Deleting feed:', title);
  if (!validateText(title)) {
    log.error('Invalid title string provided');
    return;
  }
  try {
    await deleteByTitle({ title });
  } catch (e) {
    if (e instanceof Error)
      log.error('Unable to delete feed', { errorMessage: e.message });
    return;
  }
};
