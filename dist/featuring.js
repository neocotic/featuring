(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('featuring', factory) :
  (global.featuring = factory());
}(this, (function () { 'use strict';

  /*
   * Copyright (C) 2017 Alasdair Mercer, !ninja
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */

  // TODO: Documentation

  var features = {};

  var globalFeatures = null;

  function Feature(name, scope) {
    this._name = name;
    this._scope = scope;
  }

  Feature.prototype = {

    constructor: Feature,

    active: function() {
      var target = getMap(this._scope);

      return Boolean(target && target[this._name]);
    },

    check: function() {
      if (!this.active()) {
        throw new Error(this._name + ' feature is not active');
      }
    },

    when: function(func) {
      var active = this.active();

      if (active) {
        func();
      }

      return active;
    }

  };

  function featuring(name, scope) {
    return new Feature(name, scope);
  }

  featuring.active = function(names, scope) {
    if (isString(names)) {
      names = [ names ];
    }

    var feature;

    for (var i = 0, length = names.length; i < length; i++) {
      feature = new Feature(names[i], scope);

      if (!feature.active()) {
        return false;
      }
    }

    return true;
  };

  featuring.check = function(names, scope) {
    if (isString(names)) {
      names = [ names ];
    }

    var feature;

    for (var i = 0, length = names.length; i < length; i++) {
      feature = new Feature(names[i], scope);
      feature.check();
    }
  };

  featuring.get = function(scope) {
    return getNames(getMap(scope));
  };

  featuring.init = function(names, scope) {
    if (isString(scope)) {
      if (features[scope] != null) {
        throw new Error('"' + scope + '" scope features have already been initialized');
      }

      features[scope] = createMap(names);
    } else {
      if (globalFeatures != null) {
        throw new Error('Global features have already been initialized');
      }

      globalFeatures = createMap(names);
    }
  };

  featuring.using = function(scope) {
    var boundFeaturing = applyScope(featuring, scope);
    applyScopeToAll(featuring, boundFeaturing, [
      'active',
      'check',
      'get',
      'init',
      'when'
    ], scope);

    boundFeaturing.using = featuring.using;

    return boundFeaturing;
  };

  featuring.when = function(names, scope, func) {
    var active = featuring.active(names, scope);

    if (active) {
      func();
    }

    return active;
  };

  function applyScope(func, scope) {
    return function() {
      if (func.length === 1) {
        return func(scope);
      }

      var names = arguments[0];
      var rest = Array.prototype.slice.call(arguments, 1);

      return func.apply(null, [ names, scope ].concat(rest));
    };
  }

  function applyScopeToAll(source, target, names, scope) {
    var name;

    for (var i = 0, length = names.length; i < length; i++) {
      name = names[i];
      target[name] = applyScope(source[name], scope);
    }
  }

  function createMap(names) {
    if (isString(names)) {
      names = [ names ];
    }

    var map = {};

    for (var i = 0, length = names.length; i < length; i++) {
      map[names[i]] = true;
    }

    return map;
  }

  function getMap(scope) {
    return isString(scope) ? features[scope] : globalFeatures;
  }

  function getNames(map) {
    var names = [];

    for (var key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        names.push(key);
      }
    }

    return names;
  }

  function isString(obj) {
    return typeof obj === 'string';
  }

  var featuring_1 = featuring;

  var index = featuring_1;

  return index;

})));

//# sourceMappingURL=featuring.js.map