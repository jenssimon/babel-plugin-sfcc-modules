[![NPM version][npm-image]][npm-url] [![Downloads][npm-downloads-image]][npm-url] [![Dependencies][deps-image]][deps-url] [![star this repo][gh-stars-image]][gh-url] [![fork this repo][gh-forks-image]][gh-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] ![Code Style][codestyle-image]

# babel-plugin-sfcc-modules

> Babel plugin to handle non-standard module paths used by Salesforce Commerce Cloud (SFCC)

Server-side code for Salesforce Commerce Cloud uses non-standard module resolution patterns:

- first matching cartridge from cartridge path
```javascript
require('*/cartridge/scripts/foo')
```

- current cartridge
```javascript
require('~/cartridge/scripts/bar')
```

Also there is a non-standard extension
```javascript
module.superModule
```

to reference the next match in cartridge path for the current module.

Node.js does not have solutions for these cases.. This can cause problems when you need to run this code in a Node.js environment. The most common case should be for unit testing.

This plugin removes the pain of dealing with modules like [proxyquire](https://www.npmjs.com/package/proxyquire) or [sandboxed-module](https://www.npmjs.com/package/sandboxed-module).

## Install

```sh
$ yarn add babel-plugin-sfcc-modules --dev
```

## Usage

Add to your Babel configuration:

```json
"plugins": [
  ["babel-plugin-sfcc-modules", {
    "cartridgePath": [
      "app_brand",
      "app_core",
      "app_storefront_base"
    ],
    "basePath": "./path/to/cartridges"
  }]
]
```

## Options

Option          | Type     | Description
----------------|----------|-------------
`cartridgePath` | `Array`  | the cartridge path used for lookup
`basePath`      | `string` | path to the folder containing the cartridges

## ️️⚠️️️️⚠️⚠️ Warning ⚠️⚠️⚠️

![kitten.png](https://github.com/jenssimon/babel-plugin-sfcc-modules/raw/master/kitten.png)

You shouldn't use it for frontend code. There are better alternatives to deal with a cartridge path, [NODE_PATH](https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders) and the handling of frontend assets in [sgmf-scripts](https://www.npmjs.com/package/sgmf-scripts).

In my opinion the best way to handle frontend code is to have a clean configuration of Webpack aliases.

The cartridge path concept isn't common for Node.js/frontend code. This plugin will work for it but I won't officially support it.

## License

MIT © 2019 [Jens Simon](https://github.com/jenssimon)

[npm-url]: https://www.npmjs.com/package/babel-plugin-sfcc-modules
[npm-image]: https://badgen.net/npm/v/babel-plugin-sfcc-modules
[npm-downloads-image]: https://badgen.net/npm/dt/babel-plugin-sfcc-modules

[deps-url]: https://david-dm.org/jenssimon/babel-plugin-sfcc-modules
[deps-image]: https://badgen.net/david/dep/jenssimon/babel-plugin-sfcc-modules

[gh-url]: https://github.com/jenssimon/babel-plugin-sfcc-modules
[gh-stars-image]: https://badgen.net/github/stars/jenssimon/babel-plugin-sfcc-modules
[gh-forks-image]: https://badgen.net/github/forks/jenssimon/babel-plugin-sfcc-modules

[travis-url]: https://travis-ci.com/jenssimon/babel-plugin-sfcc-modules
[travis-image]: https://travis-ci.com/jenssimon/babel-plugin-sfcc-modules.svg?branch=master

[coveralls-url]: https://coveralls.io/github/jenssimon/babel-plugin-sfcc-modules?branch=master
[coveralls-image]: https://coveralls.io/repos/github/jenssimon/babel-plugin-sfcc-modules/badge.svg?branch=master

[codestyle-image]: https://badgen.net/badge/code%20style/airbnb/f2a
