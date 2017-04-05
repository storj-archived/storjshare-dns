'use strict';

const bole = require('bole');
const path = require('path');
const fs = require('fs');

const config = {};
config.appName = 'StorjShareDNS';
config.log = bole(config.appName);
bole.output({ level: 'info', stream: process.stdout });

// We support loading our credentials in from environment variables and a
// credentials file

// file will be an empty object unless we are provided with the
// CREDENTIALS_FILE environment variable
let file = {};
let filePath = null;

if (process.env.CREDENTIALS_FILE) {
  filePath = path.resolve(process.env.CREDENTIALS_FILE);
  try {
    file = fs.readFileSync(filePath);
    file = JSON.parse(file);
  } catch (e) {
    config.log.error(e, `Failed to read ${filePath}`);
    process.exit(1);
  }
  config.log.info(`Loaded credentials from ${filePath}`);
} else {
  config.log.info('Not given credentials file, relying on env vars');
}

// A handy helper function that makes sure all values get set and gives useful
// error messages if we don't find a value for one of our config keys
function set(configKey, fileKey, envKey, defaultVal, type) {
  config[configKey] = file[fileKey] || process.env[envKey] || defaultVal;
  if (!config[configKey] && filePath) {
    config.log.error(`${filePath} does not have ${fileKey}`);
  }

  // If we weren't provided a default and the config wasn't set, error out
  if (!config[configKey] && !defaultVal) {
    config.log.error(`${envKey} not set`);
    process.exit(1);
  }

  // eslint-disable-next-line no-bitwise
  if (type === 'int') { config[configKey] |= config[configKey]; }
}

// Set all of our configuration values from the CREDENTIALS_FILE
set('key', 'private_key', 'PRIVATE_KEY');
set('serviceAccount', 'client_email', 'SERVICE_ACCOUNT');
set('projectId', 'project_id', 'PROJECT_ID');

// Set all variables from the environment
set('zone', null, 'ZONE');
set('requestPoolSize', null, 'REQUEST_POOL_SIZE', 5, 'int');
set('requestJitter', null, 'REQUEST_JITTER', 2000, 'int');
set('requestRetryCount', null, 'REQUEST_RETRY_COUNT', 5, 'int');

config.uri = `https://www.googleapis.com/dns/v1/projects/${config.projectId}`;

module.exports = config;
