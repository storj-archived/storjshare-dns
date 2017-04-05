'use strict';

const config = require('./config');
const crypto = require('crypto');
const request = require('./request');

module.exports = {};

/**
 * Create a managed zone on Google Cloud's DNS. This request is idempotent,
 * meaning you can call it multiple times for the same entry without an error.
 * If a resource already exists, this function will return success, otherwise
 * it will attempt to create the resource.
 *
 * @param {object} opts - Options object
 * @param {string} opts.uri - The project URI we are creating the resource in,
 *   i.e. https://www.googleapis.com/dns/v1/projects/core-falcon-443124
 * @param {string} opts.name - The zone you are creating, i.e. example.com
 * @param {Auth} opts.auth - An authenticated token for making the request
 * @param {function} callback - An error first callback invoked when the
 *   operation has either failed or completed. If succesfull the call will
 *   return the unique name of the resource which can be used for future
 *   requests.
 */
module.exports.create = function create(opts, cb) {
  if (typeof opts !== 'object') {
    return cb(new Error('opts must be an object'));
  }
  if (!opts.name) {
    return cb(new Error('must provide opts.name'));
  }
  if (!opts.uri) {
    return cb(new Error('must provide opts.uri'));
  }
  if (!opts.auth) {
    return cb(new Error('must provide opts.auth'));
  }

  config.log.info(`Making sure the managed zone ${opts.name} exists`);
  const uniqueName = module.exports.getName(opts.uri, opts.name);
  return request({
    uri: `${opts.uri}/managedZones`,
    method: 'POST',
    json: true,
    auth: {
      bearer: opts.auth,
    },
    body: {
      kind: 'dns#managedZone',
      // Create a globally unique but deterministic name for this resource,
      // will only collide if we are creating the same zone for the same
      // project
      name: uniqueName,
      // Fully Qualified Domain Names end in a `.`
      dnsName: `${opts.name}.`,
      description: `Created with ${config.appName}`,
    },
  }, (e, resp, body) => {
    if (e) { return cb(e); }
    config.log.debug(resp);
    // 409 means the resource already exists, which is totally fine, but any
    // other error means something has gone wrong.
    if (body.error && body.error.code !== 409) {
      return cb([new Error(body.error.message)]);
    }
    return cb(null, uniqueName);
  });
};

/**
 * Get a deterministic and globally unique resource name based on the project
 * uri and the managed zone entry. This should only collide if we are creating
 * the same zone for the same project
 *
 * @param {string} uri - The project URI we are creating the resource in,
 *   i.e. https://www.googleapis.com/dns/v1/projects/core-falcon-443124
 * @param {string} name - The zone you are creating, i.e. example.com
 * @returns {string} - 32 character string
 */
module.exports.getName = function getName(uri, name) {
  return `s${
    crypto.createHash('sha256')
      .update(uri)
      .update(name)
      .digest()
      .toString('hex')
      .substring(31)
  }`;
};
