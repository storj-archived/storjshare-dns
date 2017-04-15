'use strict';

const test = require('tape');
const st = require('supertest');
const config = require('../../lib/config.js');
const server = require('../../lib/server.js');
const Storj = require('storj');
const auth = require('../../lib/auth')(config.serviceAccount, config.key);

test('Integration Test', (t) => {
  const storj = new Storj();
  const DNS = [];
  server.init((nodeId, type) => {
    // Copied from index.js
    for (let i = 0; i < DNS.length; i += 1) {
      if (DNS[i].name.split('.')[0] === nodeId && DNS[i].type === type) {
        return {
          kind: 'dns#resourceRecordSet',
          name: DNS[i].name,
          type: DNS[i].type,
          value: DNS[i].rrdatas[0],
        };
      }
    }
    return undefined;
  }, auth);

  const key = storj.generateKeyPair();
  return st(server.app)
    .post('/')
    .set('Content-Type', 'application/json')
    .send({
      type: 'A',
      value: '127.0.0.1',
      key: key.getPublicKey(),
      signature: key.sign('127.0.0.1'),
    })
    .end((e, res) => {
      t.error(e, 'connection succeeded');
      if (e) { return t.end(); }
      t.error(res.body.error, 'request succeeded');
      if (res.body.error) { return t.end(); }
      DNS.push({
        kind: 'dns#resourceRecordSet',
        name: `${res.body.nodeId}.storj.farm.`,
        type: 'A',
        ttl: '0',
        rrdatas: ['127.0.0.1'],
      });

      return st(server.app)
        .post('/')
        .set('Content-Type', 'application/json')
        .send({
          type: 'A',
          value: '192.168.2.1',
          key: key.getPublicKey(),
          signature: key.sign('192.168.2.1'),
        })
        .end((e2, res2) => {
          t.error(e2, 'connection succeeded');
          if (e2) { return t.end(); }
          t.error(res2.body.error, 'request succeeded');
          return t.end();
        });
    });
});
