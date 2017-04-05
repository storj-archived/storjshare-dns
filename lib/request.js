'use strict';

// Create a pool of requests that limit this process to N concurrent requests
const Pool = require('concurrent-request');
const config = require('./config');

const interval = count => Math.pow(2, count) * 1000;
const handler = (e, resp, body, cb) => {
  if (e) { return cb(e); } // Network errors should be retried
  if (resp.statusCode === 429) { return cb(new Error('Rate limited')); }
  // Other API errors should be logged and not retried
  return cb(null);
};

// This pool of requests also handles retry logic with backoff and jitter
const request = new Pool({
  interval, // Exponential backoff
  jitter: config.requestJitter, // +/- ms of jitter on retry interval
  size: config.requestPoolSize, // Limit to N concurrent requests
  tries: config.requestRetryCount, // Retry up to M times (2s, 4s, 8s, 16s,...)
  handler,
});

module.exports = request;
module.exports.interval = interval;
module.exports.handler = handler;
