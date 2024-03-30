import { strict as assert } from 'node:assert';
import { Feeds } from './feeds';

const test = async () => {
  const result = await Feeds(
    [{ title: 'Node Blog', url: 'https://nodejs.org/en/feed/blog.xml' }],
    false,
  );
  assert.ok(test);
};

test();
