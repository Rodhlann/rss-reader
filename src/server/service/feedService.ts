import config from '../../config/config';
import { NormalizerFactory } from '../../util/feedNormalizer';
import { log } from '../../util/logger';
import { Feed } from '../../util/types';
import { validateText, validateUrl } from '../../util/validate';
import { cacheFeeds, getCachedFeeds } from '../db/cache';
import { DBFeed, datasource } from '../db/datasource';

type RawFeedData = {
  feed: DBFeed;
  readableStream: ReadableStream<Uint8Array> | null;
} | null;

const parseXml = async (data: RawFeedData): Promise<Feed | undefined> => {
  if (!data?.readableStream) return;
  const { feed, readableStream } = data;

  const reader = readableStream.getReader();
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

  const { title, url, category } = feed;

  try {
    const normalizer = new NormalizerFactory(title, url, category, xmlString);
    return normalizer.normalize();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error';
    log.error('Unable to normalize feed', { title, url, errorMessage: message })
  }
};

const fetchFeed = async (
  feed: DBFeed,
  count: number = 0,
): Promise<RawFeedData> => {
  return fetch(feed.url)
    .then(async (res) => {
      return { feed, readableStream: res.body };
    })
    .catch(async (err) => {
      if (count < config.feedFetchRetryCount) {
        await new Promise(resolve => setTimeout(resolve, 200))
        log.info('Retrying feed fetch', {
          title: feed.title,
          retry: `${count + 1} of ${config.feedFetchRetryCount}`,
        });
        return await fetchFeed(feed, count + 1);
      } else {
        log.error('Unable to fetch feed', {
          title: feed.title,
          errorMessage: err.message,
        });
        return null;
      }
    });
};

export const fetchFeeds = async (): Promise<Feed[]> => {
  const cachedFeeds: Feed[] | null = await getCachedFeeds();
  if (cachedFeeds?.length) {
    log.info('Resolving cached feeds');
    return cachedFeeds;
  }
  log.info('No cached feeds found');

  log.info('Fetching feed data');
  const feeds: DBFeed[] = await datasource.getAll();
  const resolved: RawFeedData[] = await Promise.all(
    feeds.map(async (feed) => fetchFeed(feed)),
  );

  if (!resolved) {
    log.warn('No feeds fetched');
    return [];
  }

  const parsedFeeds: Feed[] = (
    await Promise.all(resolved.map((res) => parseXml(res)))
  ).filter((feed): feed is Feed => !!feed);

  cacheFeeds(parsedFeeds);
  return parsedFeeds;
};

export const getDBFeeds = async (): Promise<DBFeed[]> => {
  log.info('Fetching DB feed data');
  return await datasource.getAll();
};

export const addFeed = async ({ title, url, category }: DBFeed) => {
  log.info('Adding feed:', title);
  const trimmedTitle = title.trim();
  const trimmedUrl = url.trim();

  if (!validateText(trimmedTitle)) {
    const error = 'Invalid title string provided';
    log.error(error);
    throw new Error(error);
  }
  if (!validateUrl(trimmedUrl)) {
    const error = 'Invalid URL string provided';
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
