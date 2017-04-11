'use strict';

const zone = require('./lib/zone');
const config = require('./lib/config');
const auth = require('./lib/auth')(config.serviceAccount, config.key);
const server = require('./lib/server');

// Keep track of entries
let DNS = [];
let zoneName;

// Only one invokation of updateDNS can run at a time
let updatingDNS = false;

// Sync DNS state with Google DNS
function updateDNS(cb) {
  // We don't need to worry about calling cb here, since we only use the cb in
  // init and there isn't a risk of it being invoked twice there
  if (updatingDNS) { return null; }
  updatingDNS = true;
  return auth.getToken((e, token) => {
    const opts = {
      uri: config.uri,
      name: zoneName,
      auth: token,
    };
    const callback = cb || Function.prototype;
    return zone.list(opts, (e2, entries) => {
      // Release the "mutex"
      updatingDNS = false;
      if (e2) {
        config.log.error(e2, 'Failed to update DNS entries');
        return callback(e2);
      }
      config.log.info(`Fetched ${entries.length} DNS entries`);
      DNS = entries;
      return callback();
    });
  });
}

// Used by ./lib/server to determine if we need to delete an existing DNS entry
function lookupDNS(nodeId, type) {
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
}

// Setup the server
function init(cb) {
  return auth.getToken((e, token) => {
    if (e) {
      config.log.error(e, 'Failed to fetch token');
      process.exit(1);
    }
    const opts = {
      uri: config.uri,
      name: config.zone,
      auth: token,
    };

    return zone.create(opts, (e2, name) => {
      if (e2) {
        config.log.error(e2, 'Failed to confirm zone exists');
        process.exit(1);
      }
      zoneName = name;
      return updateDNS((e3) => {
        // Refuse to start if we can't bootstrap DNS
        if (e3) {
          config.log.error(e3, 'Failed to sync initial DNS state');
          process.exit(1);
        }
        // Sync the DNS on an internval
        setInterval(updateDNS, config.dnsInterval);
        server.init(lookupDNS, auth);
        server.app.listen(config.httpPort, (e4) => {
          if (e4) {
            config.log.error(e, 'Failed to start HTTP server');
            process.exit(1);
          }
          config.log.info(`Started server on port ${config.httpPort}`);
          return cb();
        });
      });
    });
  });
}

init(() => {
  config.log.info('Finished init');
});
