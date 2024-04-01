import { XMLParser } from 'fast-xml-parser';
import { log } from '../../util/logger';
import { validateText, validateUrl } from '../../util/validate';
import { DBFeed, add, cacheFeeds, deleteByTitle, getAll, getCachedFeeds } from '../db/db';
import { Feed } from '../../util/types';

const normalizeFeeds = (parsedXml: Record<string, any>): Feed | undefined => {
  try {
    const channel = parsedXml.rss.channel;
    const items = channel.item;
    const posts = items.map(
      ({
        title,
        link,
        pubDate,
      }: {
        title: string;
        link: string;
        pubDate: string;
      }) => ({ title, link, pubDate }),
    );
    return {
      title: channel.title,
      posts,
    };
  } catch (e) {
    if (e instanceof Error)
      log.error('Unable to parse RSS feed XML', { errorMessage: e.message })
  }
};

export const fetchFeeds = async (): Promise<Feed[]> => {
  const cachedFeeds = await getCachedFeeds();
  if (cachedFeeds?.length) {
    log.info('Resolving cached feeds')
    return cachedFeeds
  }
  log.info('No cached feeds found')

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

        const parser = new XMLParser();
        const parsedXml = parser.parse(xmlString);

        return normalizeFeeds(parsedXml);
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
