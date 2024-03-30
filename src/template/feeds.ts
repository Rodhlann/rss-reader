import { XMLParser } from 'fast-xml-parser';
import { Feed } from '../db/db';
import { log } from '../util/logger';

export const Feeds = async (
  feeds: Feed[],
  isAdmin: boolean,
): Promise<string> => {
  log.info('Fetching feed data');

  const promises = feeds.map(({ url }) => fetch(url));
  const resolved = await Promise.all(promises);

  const xmlDocs = await Promise.all(
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
      return parser.parse(xmlString);
    }),
  );

  if (!xmlDocs?.length) return 'No Feeds Found';

  const allPostsByFeed = xmlDocs.map((doc) => {
    const channel = doc.rss.channel;
    const posts = channel.item;

    const currentDate = new Date();
    const lastWeekTimestamp = currentDate.setUTCDate(
      new Date().getUTCDate() - 7,
    );

    const recentPosts = posts.filter(
      ({ pubDate }: any) => new Date(pubDate).getTime() > lastWeekTimestamp,
    );

    if (!recentPosts.length) return '';

    const postCount = 3;

    const htmlPosts = recentPosts.slice(0, postCount).reduce(
      (acc: string, { title, link, pubDate }: any) =>
        (acc += `<div class="feed-post">
        <a class="feed-post-header" href="${link}">${title}</a>
        <div class="feed-post-published">
          <label><b/>Published:</b> </label><span>${new Date(pubDate).toDateString()}</span>
        </div>
      </div>`),
      '',
    );

    return `<div class="feed-wrapper">
      <h3>${channel.title}</h3>
      ${htmlPosts}
    </div>`;
  });

  return `<div class="all-feeds-wrapper">
    ${allPostsByFeed.join('')}
  </div>`;
};
