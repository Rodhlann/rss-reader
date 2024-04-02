import { XMLParser } from 'fast-xml-parser';
import { log } from './logger';
import { Feed } from './types';

type RssFeed = {
  rss: {
    channel: {
      title: string;
      item: {
        title: string;
        link: string;
        pubDate: string;
      }[];
    };
  };
};

type AtomFeed = {
  feed: {
    title: string;
    entry: {
      title: string;
      id: string;
      published: string;
    }[];
  };
};

interface FeedNormalizer {
  normalize(): Feed | undefined;
}

class RSSFeedNormalizer implements FeedNormalizer {
  private parsedXml: RssFeed;

  constructor(parsedXml: RssFeed) {
    this.parsedXml = parsedXml;
  }

  normalize(): Feed | undefined {
    try {
      const channel = this.parsedXml.rss.channel;
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
        log.error('Unable to parse RSS feed XML', { errorMessage: e.message });
    }
  }
}

class AtomFeedNormalizer implements FeedNormalizer {
  private parsedXml: AtomFeed;

  constructor(parsedXml: AtomFeed) {
    this.parsedXml = parsedXml;
  }

  normalize(): Feed | undefined {
    try {
      const feed = this.parsedXml.feed;
      const entries = feed.entry;
      const posts = entries.map(
        ({ title, id, published }: AtomFeed['feed']['entry'][0]) => ({
          title,
          link: id,
          pubDate: published,
        }),
      );
      return {
        title: feed.title,
        posts,
      };
    } catch (e) {
      if (e instanceof Error)
        log.error('Unable to parse Atom feed XML', { errorMessage: e.message });
    }
  }
}

export class NormalizerFactory {
  normalizer: FeedNormalizer | undefined;

  constructor(xmlString: string) {
    const parser = new XMLParser();

    if (xmlString.includes('</rss>')) {
      this.normalizer = new RSSFeedNormalizer(parser.parse(xmlString));
    } else if (xmlString.includes('</feed>')) {
      this.normalizer = new AtomFeedNormalizer(parser.parse(xmlString));
    } else {
      console.log(xmlString);
      log.error('Unknown feed format');
    }
  }

  normalize() {
    return this.normalizer?.normalize();
  }
}
