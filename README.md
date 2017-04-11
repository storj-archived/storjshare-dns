# StorjShare DNS Service

Manages the storj.farm TLD for farmers on the Storj network

![logo](./.github/logo.png)

[![Build Status](https://travis-ci.org/storj/storjshare-dns.png?branch=master)](https://travis-ci.org/storj/storjshare-dns)
![](https://img.shields.io/github/issues/storj/storjshare-dns.svg)
![](https://img.shields.io/npm/dm/storjshare-dns.svg)
![](https://img.shields.io/npm/dt/storjshare-dns.svg)
![](https://img.shields.io/npm/v/storjshare-dns.svg)
![](https://img.shields.io/npm/l/storjshare-dns.svg)
![](https://img.shields.io/twitter/url/https/github.com/storj/storjshare-dns.svg?style=social)

[![NPM](https://nodei.co/npm/storjshare-dns.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/storjshare-dns/)[![NPM](https://nodei.co/npm-dl/storjshare-dns.png?months=9&height=3)](https://nodei.co/npm/storjshare-dns/)

# Usage

A simple REST endpoint for registering `A` and `TXT` records for domains on the storj.farm TLD!

Simply `POST` to `/` with the following body:

```
{
  type: 'A' || 'TXT',
  value: String,
  key: String,
  signature: String,
}
```

Where `signature` is `value` signed with the private key belonging to the public key `key` which is used to generate the nodeId.

`value` will be the DNS entry we set for `nodeId`. For example, the following request:

```
{
  type: 'TXT',
  value: '127.0.0.1',
  key: 'foobar', // generates a nodeId of 6024f9d2d34412427365b2971497193a6e7004df
  signature: '127.0.0.1 signed with foobar'
}
```

Will result in the following DNS record:

```
6024f9d2d34412427365b2971497193a6e7004df.storj.farm.    A   127.0.0.1
```

We will return either an error or a 200 with the body:

```
{
  nodeId: String
}
```

Where nodeId is derived from the public key `key` we are provided

Errors:
  * `500` - Something went terribly wrong, try again later
  * `400` - A key is missing or invalid, check the body of the response for more information
  * `401` - The signature does not match the key and value
  * `409` - This node is out of sync with Google DNS, try again later (this usually happens when a client makes too many requests too quickly and is essentially the same as rate limiting)

If you are returned a non-`200` status code, the body will contain an error message in the form:

```
{
  error: String
}
```
