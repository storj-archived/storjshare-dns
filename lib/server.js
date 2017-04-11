'use strict';

const config = require('./config');
const zone = require('./zone');
const app = require('express')();
const bodyParser = require('body-parser');
const Message = require('bitcore-message');
// eslint-disable-next-line import/no-extraneous-dependencies
const bitcore = require('bitcore-lib');
const record = require('./record.js');

/**
 * lookupDNS(nodeId, type)
 *
 * Populated by our init function below, lookupDNS accepts a nodeId and type
 * and checks our local cache for any matching entries. This allows us to issue
 * a delete if necessary. This has to be passed as a function because index.js
 * updates is cache on an interval, this seems to be the cleanest way to keep
 * the logic split.
 */
let lookupDNS;

// An instantiated instance of ./auth.js set by init below
let auth;

// Body is expected to be in JSON format
app.use(bodyParser.json());

// We only accept creating or updating a route at this time, we will only
// support deleting if a real need arises.
app.post('/', (req, res) => {
  config.log.debug(req);

  /**
   * Expect messages in the following form:
   * {
   *  type: 'A' || 'TXT',
   *  value: String,
   *  key: String,
   *  signature: String,
   * }
   *
   * where `signature` is `value` signed with the private key belonging to the
   * public key `key` which is used to generate the nodeId.
   *
   * We will return either an error or a 200 with the body:
   * {
   *  nodeId: String
   * }
   *
   * Where nodeId is derived from the public key `key` we are provided
   *
   * Errors:
   *  * 500 - Something went terribly wrong, try again later
   *  * 400 - A key is missing or invalid, check the body of the response for
   *          more information
   *  * 401 - The signature does not match the key and value
   *  * 409 - This node is out of sync with Google DNS, try again later (this
   *          usually happens when a client makes too many requests too quickly
   *          and is essentially the same as rate limiting)
   *
   */
  const opts = req.body;

  if (opts.type !== 'TXT' && opts.type !== 'A') {
    return res.status(400).json({
      error: 'DNS type must either be TXT or A',
    });
  }

  if (typeof opts.key !== 'string') {
    return res.status(400).json({
      error: 'Must provide your public key',
    });
  }

  if (typeof opts.signature !== 'string') {
    return res.status(400).json({
      error: 'Must provide DNS value signed with private key',
    });
  }

  if (typeof opts.value !== 'string') {
    return res.status(400).json({
      error: 'Must provid DNS value',
    });
  }

  // NOTE: PublicKey(opts.key).toBuffer() is NOT the same as Buffer(opts.key)!
  const key = new bitcore.PublicKey(opts.key);
  const nodeId = bitcore.crypto.Hash.sha256ripemd160(
    // eslint-disable-next-line comma-dangle
    key.toBuffer()
  ).toString('hex');

  const address = bitcore.Address.fromPublicKeyHash(
    // eslint-disable-next-line comma-dangle
    new Buffer(nodeId, 'hex')
  ).toString();

  if (!Message(opts.value).verify(address, opts.signature)) {
    return res.status(401).json({
      error: 'Invalid signature',
    });
  }

  // At this point, we know the user has the private key beloning to nodeId

  return auth.getToken((e, token) => {
    const entry = {
      uri: config.uri,
      zone: zone.getName(config.uri, config.zone),
      auth: token,
      create: {
        name: nodeId,
        type: opts.type,
        value: opts.value,
      },
      delete: lookupDNS(nodeId, opts.type), // undefined if not found
    };

    if (e) {
      config.log.error(e);
      return res.status(500).json({
        error: 'Server lost authentication',
      });
    }

    return record.create(entry, (e2) => {
      if (e2) {
        config.log.error(e2);
        return res.status(500).json({
          error: 'Failed to update entry',
        });
      }
      return res.status(200).json({ nodeId });
    });
  });
});

function init(ldns, gauth) {
  lookupDNS = ldns;
  auth = gauth;
}

module.exports = {
  init,
  app,
};
