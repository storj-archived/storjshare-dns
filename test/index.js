'use strict';

const test = require('tape');
const spdx = require('spdx');
const pkg = require('../package.json');

test('npm init', (t) => {
  t.ok(pkg.name, 'Run npm init');
  return t.end();
});

test('license', (t) => {
  t.ok(pkg.license, 'must license package');
  if (!pkg.license) {
    return t.end();
  }

  // We don't use a clause, pick one or the other
  const license = spdx.parse(pkg.license).license;

  // Either enforce freedom or fully commit to the public good
  t.ok(
    license === 'AGPL-3.0' ||
    license === 'Unlicense',
    'Using either the AGPL or Unlicense');

  return t.end();
});
