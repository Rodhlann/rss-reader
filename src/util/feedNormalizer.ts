import { XMLParser } from 'fast-xml-parser';
import { log } from './logger';
import { Category, Feed } from './types';

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
  normalize(dbTitle: string, dbCategory: Category): Feed | undefined;
}

class RSSFeedNormalizer implements FeedNormalizer {
  private parsedXml: RssFeed;

  constructor(parsedXml: RssFeed) {
    this.parsedXml = parsedXml;
  }

  normalize(dbTitle: string, dbCategory: Category): Feed | undefined {
    try {
      const channel = this.parsedXml.rss.channel;
      const items = channel.item;
      const posts = items?.map(
        ({
          title,
          link,
          pubDate,
        }: {
          title: string | Record<string, string>;
          link: string;
          pubDate: string;
        }) => {
          let formattedTitle = title as string;
          if (typeof title === 'object') {
            // When post titles have html tags they are converted to an object
            // The tags seem to be placed first in the object, so the array needs reversing
            formattedTitle = Object.values(title).reverse().join(' ');
          }
          return { title: formattedTitle, link, pubDate };
        },
      );
      return {
        title: dbTitle,
        posts,
        category: dbCategory,
      };
    } catch (e) {
      if (e instanceof Error)
        log.error('Unable to parse RSS feed XML', { title: dbTitle, errorMessage: e.message });
    }
  }
}

class AtomFeedNormalizer implements FeedNormalizer {
  private parsedXml: AtomFeed;

  constructor(parsedXml: AtomFeed) {
    this.parsedXml = parsedXml;
  }

  normalize(dbTitle: string, dbCategory: Category): Feed | undefined {
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
        title: dbTitle,
        posts,
        category: dbCategory,
      };
    } catch (e) {
      if (e instanceof Error)
        log.error('Unable to parse Atom feed XML', { errorMessage: e.message });
    }
  }
}

export class NormalizerFactory {
  normalizer: FeedNormalizer | undefined;
  title: string;
  url: string;
  category: Category;

  constructor(title: string, url: string, category: Category, xmlString: string) {
    this.title = title;
    this.url = url;
    this.category = category;

    const parser = new XMLParser();

    if (xmlString.includes('</rss>')) {
      this.normalizer = new RSSFeedNormalizer(parser.parse(xmlString));
    } else if (xmlString.includes('</feed>')) {
      this.normalizer = new AtomFeedNormalizer(parser.parse(xmlString));
    } else {
      log.error('Unknown feed format', {
        feed: this.title,
        url: this.url,
        xmlString: xmlString.substring(0, 250) + '...',
      });
    }
  }

  normalize() {
    return this.normalizer?.normalize(this.title, this.category);
  }
}
