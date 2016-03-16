[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

# nano-mill
A basic build system usable for massive files transformations

## Usage

```js
var Mill = require('nano-mill');

var mill = Mill({
	plugins_folder: './plugins',
	sources_folder: './src',
	dist_folder: './dist',
	dumps_folder: './log',
	rules: {
		'js': [ /^.*\.js$/, ' > file.load, upcase, file.save > ' ]
	}
});
```


[bithound-image]: https://www.bithound.io/github/Holixus/nano-mill/badges/score.svg
[bithound-url]: https://www.bithound.io/github/Holixus/nano-mill

[gitter-image]: https://badges.gitter.im/Holixus/nano-mill.svg
[gitter-url]: https://gitter.im/Holixus/nano-mill

[npm-image]: https://badge.fury.io/js/nano-mill.svg
[npm-url]: https://badge.fury.io/js/nano-mill

[github-tag]: http://img.shields.io/github/tag/Holixus/nano-mill.svg
[github-url]: https://github.com/Holixus/nano-mill/tags

[travis-image]: https://travis-ci.org/Holixus/nano-mill.svg?branch=master
[travis-url]: https://travis-ci.org/Holixus/nano-mill

[coveralls-image]: https://coveralls.io/repos/github/Holixus/nano-mill/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/Holixus/nano-mill?branch=master

[david-image]: https://david-dm.org/Holixus/nano-mill.svg
[david-url]: https://david-dm.org/Holixus/nano-mill

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: LICENSE

[downloads-image]: http://img.shields.io/npm/dt/nano-mill.svg
[downloads-url]: https://npmjs.org/package/nano-mill
