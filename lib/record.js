'use strict';

const request = require('request');
const config = require('./config');

/**
 * Create or update a record in Google Cloud DNS. If a record already exists,
 * you are expected to provide it as `opts.delete`
 *
 * @param {object} opts - Options object
 * @param {string} opts.uri - The project URI we are creating the resource in,
 *   i.e. https://www.googleapis.com/dns/v1/projects/core-falcon-443124
 * @param {string} opts.zone - The unique zone name to create the resource in
 * @param {string} opts.create - A value to create
 * @param {string} opts.create.name - The entry you are creating, i.e. www
 * @param {string} opts.create.type - The type of record (A, TXT, etc)
 * #param {string} opts.create.value - The value of the record, i.e. 127.0.0.1
 * @param {string} opts.delete - A value to delete
 * @param {string} opts.delete.name - The entry you are creating, i.e. www
 * @param {string} opts.delete.type - The type of record (A, TXT, etc)
 * #param {string} opts.delete.value - The value of the record, i.e. 127.0.0.1
 * @param {Auth} opts.auth - An authenticated token for making the request
 * @param {function} callback - An error first callback invoked when the
 *   operation has either failed or completed.
 */
module.exports.create = function create(opts, cb) {
  if (typeof opts !== 'object') {
    return cb(new Error('opts must be an object'));
  }
  if (!opts.uri) {
    return cb(new Error('must provide a opts.uri'));
  }
  if (!opts.zone) {
    return cb(new Error('must provide opts.zone'));
  }
  if (!opts.auth) {
    return cb(new Error('must provide opts.create.auth'));
  }
  if (!opts.create) {
    return cb(new Error('must provide opts.create'));
  }
  if (!opts.create.name) {
    return cb(new Error('must provide opts.create.name'));
  }
  if (!opts.create.type) {
    return cb(new Error('must provide opts.create.type'));
  }
  if (!opts.create.value) {
    return cb(new Error('must provide opts.create.value'));
  }

  config.log.info('Creating resource', opts);

  const reqBody = {
    kind: 'dns#change',
    additions: [{
      kind: 'dns#resourceRecordSet',
      name: `${opts.create.name}.storj.farm.`,
      type: opts.create.type,
      ttl: 0,
      rrdatas: [opts.create.value],
    }],
    deletions: [],
  };

  if (opts.delete) {
    reqBody.deletions.push({
      kind: 'dns#resourceRecordSet',
      name: `${opts.delete.name}`, // already has .storj.farm
      type: opts.delete.type,
      ttl: 0,
      rrdatas: [opts.delete.value],
    });
  }

  return request({
    uri: `${opts.uri}/managedZones/${opts.zone}/changes`,
    method: 'POST',
    json: true,
    auth: {
      bearer: opts.auth,
    },
    body: reqBody,
  }, (e, resp, body) => {
    if (e) { return cb(e); }
    return cb(null, body);
  });
};
