'use strict';

const gtoken = require('gtoken');

/**
 * Maintain an authenticated state for speaking with the Google Cloud API. The
 * arguments should come from a json key file obtained from the gcloud cli
 * tool, and should belong to an OAuth Service Account given the dns.admin
 * role.
 *
 * tl;dr: run the following commands
 *
 * ```
 * $ gcloud iam service-accounts create storjfarm
 * $ gcloud iam service-accounts list
 * $ # Take note of the full account name storjfarm@[...]
 * $ gcloud projects add-iam-policy-binding [project_id] \
 *   --member serviceAccount:storjfarm@[...] --role roles/dns.admin
 * $ gcloud iam service-accounts keys create creds.json \
 *   --iam-account storjfarm@[...]
 * ```
 *
 * creds.json now contains everything you need for using this library
 *
 * @constructor
 * @param {string} email - client_email from creds.json
 * @param {string} key - private_key from creds.json
 * @param {string[]} scope - An array of scopes, for example:
 *   ['https://www.googleapis.com/auth/ndev.clouddns.readwrite']
 */
function Auth(email, key, scope) {
  if (!(this instanceof Auth)) {
    return new Auth(email, key, scope);
  }

  this.gtoken = gtoken({
    email,
    key,
    scope: scope || ['https://www.googleapis.com/auth/ndev.clouddns.readwrite'],
  });
}

Auth.prototype.getToken = function getToken(cb) {
  // Will fetch a new token over the network if either we don't yet have a
  // token or if the token we have has expired.
  return this.gtoken.getToken(cb);
};

module.exports = Auth;
