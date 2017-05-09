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

[featuring](https://github.com/NotNinja/featuring) is a simple lightweight immutable feature toggle JavaScript library.

[![Build Status](https://img.shields.io/travis/NotNinja/featuring/develop.svg?style=flat-square)](https://travis-ci.org/NotNinja/featuring)
[![Coverage](https://img.shields.io/coveralls/NotNinja/featuring/develop.svg?style=flat-square)](https://coveralls.io/github/NotNinja/featuring)
[![Dev Dependency Status](https://img.shields.io/david/dev/NotNinja/featuring.svg?style=flat-square)](https://david-dm.org/NotNinja/featuring?type=dev)
[![License](https://img.shields.io/npm/l/featuring.svg?style=flat-square)](https://github.com/NotNinja/featuring/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/featuring.svg?style=flat-square)](https://www.npmjs.com/package/featuring)

* [Install](#install)
* [API](#api)
* [Best Practices](#best-practices)
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

* [Development Version](https://cdn.rawgit.com/NotNinja/featuring/master/dist/featuring.js) (41kb)
* [Production Version](https://cdn.rawgit.com/NotNinja/featuring/master/dist/featuring.min.js) (2.6kb - [Source Map](https://cdn.rawgit.com/NotNinja/featuring/master/dist/featuring.min.js.map))

## API

TODO: Complete

All API methods accept an optional `scope` parameter which defaults to a global/shared scope, however, it is recommended
that libraries and frameworks always specify `scope` (which couldn't be easier via
[featuring.using](#featuringusingscope)) so that applications are free to use the global scope freely, unless a
library/framework plans to package the featuring library within their own distribution bundle so that it's only used by
themselves.

All strings that are passed to the API are case sensitive.

### Initialization

TODO: Introduction

#### `featuring.init(names[, scope])`

TODO: Complete

#### `featuring.initialized([scope])`

TODO: Complete

#### `featuring.using([scope])`

TODO: Complete

### Individual Features

TODO: Introduction

#### `featuring(name[, scope])`

TODO: Complete

##### `Feature#active()`

TODO: Complete

##### `Feature#using([scope])`

TODO: Complete

##### `Feature#when(func)`

TODO: Complete

##### `Feature#verify()`

TODO: Complete

### Multiple features

TODO: Introduction

#### `featuring.active(names[, scope])`

TODO: Complete

#### `featuring.active.any(names[, scope])`

**Alias:** `featuring.anyActive`

TODO: Complete

#### `featuring.verify(names[, scope])`

TODO: Complete

#### `featuring.verify.any(names[, scope])`

**Alias:** `featuring.verifyAny`

TODO: Complete

#### `featuring.when(names[, scope], func)`

TODO: Complete

#### `featuring.when.any(names[, scope], func)`

**Alias:** `featuring.whenAny`

TODO: Complete

### Miscellaneous

TODO: Introduction

#### `featuring.get([scope])`

TODO: Complete

#### `featuring.scopes()`

TODO: Complete

## Best Practices

As mentioned in the [API](#api) section, libraries and frameworks are advised to only ever use scopes for their
features. This allows applications to take advantage of the global scope and avoid conflicts. If you find a library or
framework using the global scope, please make them aware that they should be using a scope.

Since you'll want to ensure that your code only ever checks features once they're initialized, it's recommended that you
simply have a single module that imports featuring, initializes it with your active features, and then exports it via
[featuring.using](#featuringusingscope). Now your code will simply import this new module, instead of directly importing
featuring, to ensure that the same scope and features are always used throughout your code base.

For simple applications, libraries, and frameworks, this module can easily be internal without causing issues, however,
for modular projects, you may want to externalize this module so that it can be depended on by each module.

## Bugs

If you have any problems with featuring or would like to see changes currently in development you can do so
[here](https://github.com/NotNinja/featuring/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/NotNinja/featuring/blob/master/CONTRIBUTING.md). We want your suggestions and pull
requests!

A list of featuring contributors can be found in
[AUTHORS.md](https://github.com/NotNinja/featuring/blob/master/AUTHORS.md).

## License

See [LICENSE.md](https://github.com/NotNinja/featuring/raw/master/LICENSE.md) for more information on our MIT license.

[![Copyright !ninja](https://cdn.rawgit.com/NotNinja/branding/master/assets/copyright/base/not-ninja-copyright-186x25.png)](https://not.ninja)
