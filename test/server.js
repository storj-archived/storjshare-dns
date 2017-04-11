'use strict';

/*
const test = require('tape');
const proxyquire = require('proxyquire');
const st = require('supertest');

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
  t.end();
});

test('create 409', (t) => {
  const zone = proxyquire('../lib/zone.js', {
    './record': {
      create: (opts, cb) => {
      }
    }
  });

  zone.create({ uri: 'lol', name: 'foo', auth: 'bar' }, (e, name) => {
    t.error(e, 'should not error on 409');
    t.ok(name, 'should return generated name');
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

test('Integration Test', function(t) {
  const config = require('../lib/config.js');
  const server = require('../lib/server.js');
  const storj = new require('storj')();
  const auth = require('../lib/auth')(config.serviceAccount, config.key);
  const DNS = []
  server.init((nodeId, type) => {
    // Copied from index.js
    for (let i = 0; i < DNS.length; i++) {
      if (DNS[i].name.split('.')[0] === nodeId && DNS[i].type === type) {
        return {
          kind: 'dns#resourceRecordSet',
          name: DNS[i].name,
          type: DNS[i].type,
          value: DNS[i].rrdatas[0],
        }
      }
    }
    return undefined;
  }, auth);

  var key = storj.generateKeyPair();
  st(server.app)
  .post('/')
  .set('Content-Type', 'application/json')
  .send({
    type: 'A',
    value: '127.0.0.1',
    key: key.getPublicKey(),
    signature: key.sign('127.0.0.1'),
  })
  .end(function (e, res) {
    t.error(e, 'connection succeeded');
    if(e) { return t.end(); }
    t.error(res.body.error, 'request succeeded');
    if(res.body.error) { return t.end(); }
    DNS.push({
      kind: 'dns#resourceRecordSet',
      name: `${res.body.nodeId}.storj.farm.`,
      type: 'A',
      ttl: '0',
      rrdatas: [ '127.0.0.1' ],
    });

    st(server.app)
    .post('/')
    .set('Content-Type', 'application/json')
    .send({
      type: 'A',
      value: '192.168.2.1',
      key: key.getPublicKey(),
      signature: key.sign('192.168.2.1'),
    })
    .end(function (e, res) {
      t.error(e, 'connection succeeded');
      if(e) { return t.end(); }
      t.error(res.body.error, 'request succeeded');
      t.end();
    });
  });
});
*/
