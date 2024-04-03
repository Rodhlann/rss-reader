const DEFAULT = '\x1b[39m';
const GREEN = (text: string) => `\x1b[32m${text}${DEFAULT}`;
const RED = (text: string) => `\x1b[91m${text}${DEFAULT}`;
const YELLOW = (text: string) => `\x1b[93m${text}${DEFAULT}`;

export const log = {
  info: (string: string, ...context: string[] | Record<string, string | number>[]) =>
    console.log(GREEN('[INFO]'), string, ...context),
  warn: (string: string, ...context: string[] | Record<string, string>[]) =>
    console.warn(YELLOW('[WARN]'), string, ...context),
  error: (string: string, ...context: string[] | Record<string, string>[]) =>
    console.error(RED('[ERROR]'), string, ...context),
};
