     .d888                  888                     d8b
    d88P"                   888                     Y8P
    888                     888
    888888 .d88b.   8888b.  888888 888  888 888d888 888 88888b.   .d88b.
    888   d8P  Y8b     "88b 888    888  888 888P"   888 888 "88b d88P"88b
    888   88888888 .d888888 888    888  888 888     888 888  888 888  888
    888   Y8b.     888  888 Y88b.  Y88b 888 888     888 888  888 Y88b 888
    888    "Y8888  "Y888888  "Y888  "Y88888 888     888 888  888  "Y88888
                                                                      888
                                                                 Y8b d88P
                                                                  "Y88P"

[featuring](https://github.com/neocotic/featuring) is a simple lightweight immutable feature toggle JavaScript library.

[![Build Status](https://img.shields.io/travis/neocotic/featuring/develop.svg?style=flat-square)](https://travis-ci.org/neocotic/featuring)
[![Coverage](https://img.shields.io/codecov/c/github/neocotic/featuring/develop.svg?style=flat-square)](https://codecov.io/gh/neocotic/featuring)
[![Dev Dependency Status](https://img.shields.io/david/dev/neocotic/featuring.svg?style=flat-square)](https://david-dm.org/neocotic/featuring?type=dev)
[![License](https://img.shields.io/npm/l/featuring.svg?style=flat-square)](https://github.com/neocotic/featuring/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/featuring.svg?style=flat-square)](https://www.npmjs.com/package/featuring)

* [Install](#install)
* [API](#api)
* [Bugs](#bugs)
* [Contributors](#contributors)
* [License](#license)

## Install

Install using the package manager for your desired environment(s):

``` bash
$ npm install --save featuring
# OR:
$ bower install --save featuring
```

While equals should be compatible with all versions of [Node.js](https://nodejs.org), it is only tested against version
4 and above.

If you want to simply download the file to be used in the browser you can find them below:

* [Development Version](https://cdn.rawgit.com/neocotic/featuring/master/dist/featuring.js) (15kb - [Source Map](https://cdn.rawgit.com/neocotic/featuring/master/dist/featuring.js.map))
* [Production Version](https://cdn.rawgit.com/neocotic/featuring/master/dist/featuring.min.js) (1.2kb - [Source Map](https://cdn.rawgit.com/neocotic/featuring/master/dist/featuring.min.js.map))

## API

All feature names that are passed to the API are case sensitive.

### `Featuring([features])`

Encapsulates the named active `features` provided, allowing them to be queried at any time while preventing them from
being modified.

``` javascript
var Featuring = require('featuring');
var features = new Featuring([ 'FOO', 'BAR' ]);
// OR:
var featuring = require('featuring');
var features = featuring([ 'FOO', 'BAR' ]);

features.active('FOO');
//=> true
features.active([ 'FOO', 'BUZZ' ]);
//=> false
features.anyActive([ 'FOO', 'BAR' ]);
//=> true

features.get();
//=> [ "FOO", "BAR" ]

features.verify('FOO');
// ...
features.verify([ 'FOO', 'BUZZ' ]);
//=> Error("BUZZ" feature is not active)
features.verifyAny([ 'FOO', 'BAR' ]);
// ...

features.when('FOO', function() {
 // ...
});
features.when([ 'FOO', 'BUZZ' ], function() {
 // Never called
});
features.whenAny([ 'FOO', 'BAR' ], function() {
 // ...
});
```

### `Featuring#active([names])`

Returns whether **all** of the named features are active.

``` javascript
var features = require('featuring')([ 'FOO', 'BAR' ]);

features.active('FOO');
//=> true
features.active('BUZZ');
//=> false
features.active([ 'FOO', 'BAR' ]);
//=> true
features.active([ 'FOO', 'BUZZ' ]);
//=> false
features.active([ 'foo', 'bar' ]);
//=> false

features.active(null);
//=> true
features.active([]);
//=> true
```

### `Featuring#anyActive([names])`

**Alias:** `Featuring#active.any`

Returns whether **any** of the named features are active.

``` javascript
var features = require('featuring')([ 'FOO', 'BAR' ]);

features.anyActive('FOO');
//=> true
features.anyActive('BUZZ');
//=> false
features.anyActive([ 'FOO', 'BAR' ]);
//=> true
features.anyActive([ 'FOO', 'BUZZ' ]);
//=> true
features.anyActive([ 'foo', 'bar' ]);
//=> false

features.anyActive(null);
//=> false
features.anyActive([]);
//=> false
```

### `Featuring#get()`

Returns the names of all of the active features.

``` javascript
var featuring = require('featuring');

featuring([]).get();
//=> []
featuring('FOO').get();
//=> [ "FOO" ]
featuring([ 'FOO', 'BAR' ]).get();
//=> [ "FOO", "BAR" ]
```

### `Featuring#verify([names])`

Verifies that **all** of the named features are active and throws an error if they are not.

This method is useful for fail-fast situations where it's best if the code simply breaks when the named features are not
active.

``` javascript
var features = require('featuring')([ 'FOO', 'BAR' ]);

features.verify('FOO');
// ...
features.verify('BUZZ');
//=> Error("BUZZ" feature is not active)
features.verify([ 'FOO', 'BAR' ]);
//=> ...
features.verify([ 'FOO', 'BUZZ' ]);
//=> Error("BUZZ" feature is not active)
features.verify([ 'foo', 'bar' ]);
//=> Error("foo" feature is not active)

features.verify(null);
// ...
features.verify([]);
// ...
```

### `Featuring#verifyAny([names])`

**Alias:** `Featuring#verify.any`

Verifies that **any** of the named features are active and throws an error if this is not the case.

This method is useful for fail-fast situations where it's best if the code simply breaks when none of the named features
are active.

``` javascript
var features = require('featuring')([ 'FOO', 'BAR' ]);

features.verifyAny('FOO');
// ...
features.verifyAny('BUZZ');
//=> Error(All named features are not active)
features.verifyAny([ 'FOO', 'BAR' ]);
//=> ...
features.verifyAny([ 'FOO', 'BUZZ' ]);
// ...
features.verifyAny([ 'foo', 'bar' ]);
//=> Error(All named features are not active)

features.verifyAny(null);
//=> Error(All named features are not active)
features.verifyAny([]);
//=> Error(All named features are not active)
```

### `Featuring#when([names, ]func)`

Invokes the specified function only when **all** of the named features are active.

This method is often preferred over using [Featuring#active](#featuringactivenames) within an `if` expression when
wrapping large code as it helps to prevent potential scoping issues (e.g. from variable hoisting) and can even be
simpler to replace with IIFEs, when taking that route.

``` javascript
var features = require('featuring')([ 'FOO', 'BAR' ]);

features.when('FOO', function() {
  // ...
});
features.when('BUZZ', function() {
  // Never called
});
features.when([ 'FOO', 'BAR' ], function() {
  // ...
});
features.when([ 'FOO', 'BUZZ' ], function() {
  // Never called
});
features.when([ 'foo', 'bar' ], function() {
  // Never called
});

features.when(null, function() {
  // ...
});
features.when([], function() {
  // ...
});
```

### `Featuring#whenAny([names, ]func)`

**Alias:** `Featuring#when.any`

Invokes the specified function only when **any** of the named features are active.

This method is often preferred over using [Featuring#anyActive](#featuringanyactivenames) within an `if` expression when
wrapping large code as it helps to prevent potential scoping issues (e.g. from variable hoisting) and can even be
simpler to replace with IIFEs, when taking that route.

``` javascript
var features = require('featuring')([ 'FOO', 'BAR' ]);

features.whenAny('FOO', function() {
  // ...
});
features.whenAny('BUZZ', function() {
  // Never called
});
features.whenAny([ 'FOO', 'BAR' ], function() {
  // ...
});
features.whenAny([ 'FOO', 'BUZZ' ], function() {
  // ...
});
features.whenAny([ 'foo', 'bar' ], function() {
  // Never called
});

features.whenAny(null, function() {
  // Never called
});
features.whenAny([], function() {
  // Never called
});
```

## Bugs

If you have any problems with featuring or would like to see changes currently in development you can do so
[here](https://github.com/neocotic/featuring/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/neocotic/featuring/blob/master/CONTRIBUTING.md). We want your suggestions and pull
requests!

A list of featuring contributors can be found in
[AUTHORS.md](https://github.com/neocotic/featuring/blob/master/AUTHORS.md).

## License

Copyright © 2018 Alasdair Mercer

See [LICENSE.md](https://github.com/neocotic/featuring/raw/master/LICENSE.md) for more information on our MIT license.
