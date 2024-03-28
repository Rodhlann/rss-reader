import { Feed, add, deleteByTitle } from '../db/db';
import { log } from '../util/logger';
import { validateText, validateUrl } from '../util/validate';

export const addFeed = async ({ title, url }: Feed) => {
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
    log.info('Feed added:', trimmedTitle);
  } catch (e) {
    log.error('Unable to add feed', { errorMessage: e.message });
    return;
  }
};

export const deleteFeed = async ({ title }: Omit<Feed, 'url'>) => {
  log.info('Deleting feed:', title);
  if (!validateText(title)) {
    log.error('Invalid title string provided');
    return;
  }
  try {
    await deleteByTitle({ title });
    log.info('Feed deleted:', title);
  } catch (e) {
    log.error('Unable to delete feed', { errorMessage: e.message });
    return;
  }
};
