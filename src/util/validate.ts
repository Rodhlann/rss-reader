export const validateUrl = (url: string): Boolean =>
  typeof url === 'string' && !!url.match(/^(?:https?|ftp):\/\/(?:\w+[\-]?\w*\.?)+(?:\/[\w#!:.?+=&%@!\-\/]*)?$/);
export const validateText = (text: string) =>
  typeof text === 'string' && !!text.match(/^[a-zA-Z0-9\s]*$/);
