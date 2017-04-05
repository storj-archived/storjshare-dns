'use strict';

const test = require('tape');

let request;
const config = {
  key: 'foobar',
  serviceAccount: 'buzzbazz',
  projectId: 'bitbang',
  zone: 'clickclack',
  uri: 'riffiwobbles',
  appName: 'squawk',
  requestPoolSize: Infinity,
  requestJitter: 0,
  requestRetryCount: Infinity,
  log: {
    error: Function.prototype,
    warn: Function.prototype,
    info: Function.prototype,
    debug: Function.prototype,
  },
};

// Prevent config from loading
test('stub config', (t) => {
  const configPath = require.resolve('../lib/config');
  require.cache[configPath] = {
    id: configPath,
    exports: config,
  };
  // eslint-disable-next-line global-require
  request = require('../lib/request');
  t.end();
});

test('interval increases with time', (t) => {
  const results = [];
  for (let i = 0; i < 5; i += 1) {
    const result = request.interval(i);
    results.forEach(v => t.ok(result > v, 'greater than i - 1'));
    results.push(result);
  }
  t.end();
});

test('handler 429', (t) => {
  request.handler(null, { statusCode: 429 }, null, (e) => {
    t.ok(e, 'returned error');
    t.end();
  });
});

test('handler error', (t) => {
  request.handler(new Error('oops'), null, null, (e) => {
    t.ok(e, 'returned error');
    t.end();
  });
});

test('handler fallthrough', (t) => {
  request.handler(null, { statusCode: 200 }, null, (e) => {
    t.error(e, 'everything else condisered a request');
    t.end();
  });
});

test('Reset require state', (t) => {
  // Leave tape's state
  Object.keys(require.cache).forEach((v) => {
    if (v !== require.resolve('tape')) { delete require.cache[v]; }
  });
  t.equal(Object.keys(require.cache).length, 1, 'Removed all require cache');
  t.end();
});
