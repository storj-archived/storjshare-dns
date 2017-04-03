# Node.js Template
### _Simple template for bootstrapping Node.js projects_

![logo](./.github/logo.png)

[![Build Status](https://travis-ci.org/retrohacker/node-template.png?branch=master)](https://travis-ci.org/retrohacker/node-template)
![](https://img.shields.io/github/issues/retrohacker/node-template.svg)
![](https://img.shields.io/npm/dm/node-template.svg)
![](https://img.shields.io/npm/dt/node-template.svg)
![](https://img.shields.io/npm/v/node-template.svg)
![](https://img.shields.io/npm/l/node-template.svg)
![](https://img.shields.io/twitter/url/https/github.com/retrohacker/node-template.svg?style=social)

[![NPM](https://nodei.co/npm/node-template.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-template/)[![NPM](https://nodei.co/npm-dl/node-template.png?months=9&height=3)](https://nodei.co/npm/node-template/)

### Usage

Fork, `npm install`, and start developing!

> Note: You should open up [README.md](./README.md) and update the badges and description to reflect your project

### Features

* Default .travis.yml configured for both [LTS](https://github.com/nodejs/LTS) releases of Node.js
* Checks for license
  * [AGPL](https://choosealicense.com/licenses/agpl-3.0/) - Fully commit package to freedom
  * [The Unlicense](https://choosealicense.com/licenses/unlicense/) - Fully commit package to public domain
* Code coverage through [nyc](https://www.npmjs.com/package/nyc)
* Extremely opinionated styleguide:
  * Enforced through [eslint](http://eslint.org)
  * Using [eslint-config-airbnb-base](http://www.npmjs.com/package/eslint-config-airbnb-base)
* Ensures `npm init` was run
