'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

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
  const configPath = require.resolve('../../lib/config');
  require.cache[configPath] = {
    id: configPath,
    exports: config,
  };
  t.end();
});

test('create: 409', (t) => {
  const zone = proxyquire('../../lib/zone.js', {
    './request': (opts, cb) => cb(null, {}, { error: { code: 409 } }),
  });

  zone.create({ uri: 'lol', name: 'foo', auth: 'bar' }, (e, name) => {
    t.error(e, 'should not error on 409');
    t.ok(name, 'should return generated name');
    t.end();
  });
});

test('create: error', (t) => {
  const zone = proxyquire('../../lib/zone.js', {
    './request': (opts, cb) => cb([new Error('ENOTFOUND')]),
  });

  zone.create({ uri: 'lol', name: 'foo', auth: 'bar' }, (e, name) => {
    t.ok(e, 'should return array of errors on failure');
    t.ok(name === undefined, 'dont return name on failure');
    t.end();
  });
});

test('create: 500', (t) => {
  const zone = proxyquire('../../lib/zone.js', {
    './request': (opts, cb) =>
      cb(null, {}, {
        error: {
          code: 500,
          message: 'Goblins',
        },
      }),
  });

  zone.create({ uri: 'lol', name: 'foo', auth: 'bar' }, (e, name) => {
    t.ok(e, 'should return array of errors on failure');
    t.ok(name === undefined, 'dont return name on failure');
    t.end();
  });
});

test('create: check inputs', (t) => {
  const zone = proxyquire('../../lib/zone.js', {
    './request': (opts, cb) => cb(null, {}, {}),
  });
  zone.create('invalid opts', (e) => {
    t.ok(e, 'should return error');
  });
  zone.create({ uri: 'bar', auth: 'buzz' }, (e) => {
    t.ok(e, 'should return error');
  });
  zone.create({ name: 'foo', auth: 'buzz' }, (e) => {
    t.ok(e, 'should return error');
  });
  zone.create({ name: 'foo', uri: 'bar' }, (e) => {
    t.ok(e, 'should return error');
    t.end();
  });
});

test('list: error', (t) => {
  const zone = proxyquire('../../lib/zone.js', {
    './request': (opts, cb) => cb([new Error('foobar')]),
  });

  zone.list({ uri: 'lol', name: 'foo', auth: 'bar' }, (e, records) => {
    t.ok(e instanceof Array, 'should return error array');
    t.ok(records == null, 'shouldnt return records');
    t.end();
  });
});

test('list: two pages', (t) => {
  let invoked = false;
  const zone = proxyquire('../../lib/zone.js', {
    './request': (opts, cb) => {
      const result = { changes: [] };
      result.changes.push({ additions: ['foo'] });
      if (!invoked) {
        invoked = true;
        result.nextPageToken = 'bar';
      }
      return cb(null, {}, result);
    },
  });

  zone.list({ uri: 'lol', name: 'foo', auth: 'bar' }, (e, records) => {
    t.error(e, 'succeeds');
    t.ok(records instanceof Array, 'returned array of records');
    if (!(records instanceof Array)) {
      return t.end();
    }
    t.equal(records.length, 2, 'returned two records');
    for (let i = 0; i < records.length; i += 1) {
      t.equal(records[i], 'foo', 'all elements should be foo');
    }
    return t.end();
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
