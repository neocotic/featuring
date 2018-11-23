(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('featuring', factory) :
  (global.featuring = factory());
}(this, (function () { 'use strict';

  /*
   * Copyright (C) 2018 Alasdair Mercer
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

  /**
    * Encapsulates the named active <code>features</code> provided, allowing them to be queried at any time while
    * preventing them from being modified.
    *
    * It is important to remember that <code>features</code> are case sensitive, so subsequent calls to methods on the
    * returned instance must <b>exactly</b> match that in which it appears within <code>features</code>.
    *
    * @example
    * <pre>
    * var features = require('featuring')([ 'FOO', 'BAR' ]);
    *
    * features.active('FOO');
    * //=> true
    * features.active([ 'FOO', 'BUZZ' ]);
    * //=> false
    * features.anyActive([ 'FOO', 'BAR' ]);
    * //=> true
    *
    * features.get();
    * //=> [ "FOO", "BAR" ]
    *
    * features.verify('FOO');
    * // ...
    * features.verify([ 'FOO', 'BUZZ' ]);
    * //=> Error("BUZZ" feature is not active)
    * features.verifyAny([ 'FOO', 'BAR' ]);
    * // ...
    *
    * features.when('FOO', function() {
    *   // ...
    * });
    * features.when([ 'FOO', 'BUZZ' ], function() {
    *   // Never called
    * });
    * features.whenAny([ 'FOO', 'BAR' ], function() {
    *   // ...
    * });
    * </pre>
    * @param {string|string[]} [features] - the names of the features to be active (may be <code>null</code>)
    * @public
    * @constructor
    */
  function Featuring(features) {
    if (!(this instanceof Featuring)) {
      return new Featuring(features);
    }

    features = sanitizeNames(features).slice();

    /**
     * A reference to this instance.
     *
     * @private
     * @type {Featuring}
     */
    var self = this;

    /**
     * A map containing all active features.
     *
     * @private
     * @type {Object.<string, boolean>}
     */
    var map = {};

    features.forEach(function(name) {
      map[name] = true;
    });

    /**
     * Returns whether <b>all</b> of the named features are active.
     *
     * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including their case.
     *
     * @example
     * <pre>
     * var features = require('featuring')([ 'FOO', 'BAR' ]);
     *
     * features.active('FOO');
     * //=> true
     * features.active('BUZZ');
     * //=> false
     * features.active([ 'FOO', 'BAR' ]);
     * //=> true
     * features.active([ 'FOO', 'BUZZ' ]);
     * //=> false
     * features.active([ 'foo', 'bar' ]);
     * //=> false
     *
     * features.active(null);
     * //=> true
     * features.active([]);
     * //=> true
     * </pre>
     * @param {string|string[]} [names] - the names of the features to be checked (may be <code>null</code>)
     * @return {boolean} <code>true</code> if all of the named features are active or <code>names</code> is
     * <code>null</code> or empty; otherwise <code>false</code>.
     * @public
     * @memberof Featuring#
     */
    self.active = function(names) {
      return sanitizeNames(names).every(function(name) {
        return isActive(map, name);
      });
    };

    /**
     * Returns whether <b>any</b> of the named features are active.
     *
     * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including their case.
     *
     * This method can also be accessed via {@link Featuring#active.any}.
     *
     * @example
     * <pre>
     * var features = require('featuring')([ 'FOO', 'BAR' ]);
     *
     * features.anyActive('FOO');
     * //=> true
     * features.anyActive('BUZZ');
     * //=> false
     * features.anyActive([ 'FOO', 'BAR' ]);
     * //=> true
     * features.anyActive([ 'FOO', 'BUZZ' ]);
     * //=> true
     * features.anyActive([ 'foo', 'bar' ]);
     * //=> false
     *
     * features.anyActive(null);
     * //=> false
     * features.anyActive([]);
     * //=> false
     * </pre>
     * @param {string|string[]} [names] - the names of the features to be checked (may be <code>null</code>)
     * @return {boolean} <code>true</code> if any of the named features are active; otherwise <code>false</code>.
     * @public
     * @memberof Featuring#
     */
    self.anyActive = self.active.any = function(names) {
      return sanitizeNames(names).some(function(name) {
        return isActive(map, name);
      });
    };

    /**
     * Returns the names of all of the active features.
     *
     * @example
     * <pre>
     * var featuring = require('featuring');
     *
     * featuring([]).get();
     * //=> []
     * featuring('FOO').get();
     * //=> [ "FOO" ]
     * featuring([ 'FOO', 'BAR' ]).get();
     * //=> [ "FOO", "BAR" ]
     * </pre>
     * @return {string[]} The names of all active features.
     * @public
     * @memberof Featuring#
     */
    self.get = function() {
      return features.slice();
    };

    /**
     * Verifies that <b>all</b> of the named features are active and throws an error if they are not.
     *
     * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including their case.
     *
     * This method is useful for fail-fast situations where it's best if the code simply breaks when the named features
     * are not active.
     *
     * @example
     * <pre>
     * var features = require('featuring')([ 'FOO', 'BAR' ]);
     *
     * features.verify('FOO');
     * // ...
     * features.verify('BUZZ');
     * //=> Error("BUZZ" feature is not active)
     * features.verify([ 'FOO', 'BAR' ]);
     * //=> ...
     * features.verify([ 'FOO', 'BUZZ' ]);
     * //=> Error("BUZZ" feature is not active)
     * features.verify([ 'foo', 'bar' ]);
     * //=> Error("foo" feature is not active)
     *
     * features.verify(null);
     * // ...
     * features.verify([]);
     * // ...
     * </pre>
     * @param {string|string[]} [names] - the names of the features to be verified (may be <code>null</code>)
     * @return {Featuring} A reference to this instance for chaining purposes.
     * @throws {Error} If any of the named features are not active.
     * @public
     * @memberof Featuring#
     */
    self.verify = function(names) {
      sanitizeNames(names).forEach(function(name) {
        verifyActive(map, name);
      });

      return self;
    };

    /**
     * Verifies that <b>any</b> of the named features are active and throws an error if this is not the case.
     *
     * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including their case.
     *
     * This method is useful for fail-fast situations where it's best if the code simply breaks when none of the named
     * features are active.
     *
     * This method can also be accessed via {@link Featuring#verify.any}.
     *
     * @example
     * <pre>
     * var features = require('featuring')([ 'FOO', 'BAR' ]);
     *
     * features.verifyAny('FOO');
     * // ...
     * features.verifyAny('BUZZ');
     * //=> Error(All named features are not active)
     * features.verifyAny([ 'FOO', 'BAR' ]);
     * //=> ...
     * features.verifyAny([ 'FOO', 'BUZZ' ]);
     * // ...
     * features.verifyAny([ 'foo', 'bar' ]);
     * //=> Error(All named features are not active)
     *
     * features.verifyAny(null);
     * //=> Error(All named features are not active)
     * features.verifyAny([]);
     * //=> Error(All named features are not active)
     * </pre>
     * @param {string|string[]} [names] - the names of the features to be verified (may be <code>null</code>)
     * @return {Featuring} A reference to this instance for chaining purposes.
     * @throws {Error} If all of the named features are not active  or <code>names</code> is <code>null</code> or empty.
     * @public
     * @memberof Featuring#
     */
    self.verifyAny = self.verify.any = function(names) {
      if (self.anyActive(names)) {
        return self;
      }

      throw new Error('All named features are not active');
    };

    /**
     * Invokes the specified function only when <b>all</b> of the named features are active.
     *
     * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including their case.
     *
     * This method is often preferred over using {@link Featuring#active} within an <code>if</code> expression when
     * wrapping large code as it helps to prevent potential scoping issues (e.g. from variable hoisting) and can even be
     * simpler to replace with IIFEs, when taking that route.
     *
     * @example
     * <pre>
     * var features = require('featuring')([ 'FOO', 'BAR' ]);
     *
     * features.when('FOO', function() {
     *   // ...
     * });
     * features.when('BUZZ', function() {
     *   // Never called
     * });
     * features.when([ 'FOO', 'BAR' ], function() {
     *   // ...
     * });
     * features.when([ 'FOO', 'BUZZ' ], function() {
     *   // Never called
     * });
     * features.when([ 'foo', 'bar' ], function() {
     *   // Never called
     * });
     *
     * features.when(null, function() {
     *   // ...
     * });
     * features.when([], function() {
     *   // ...
     * });
     * </pre>
     * @param {string|string[]} [names] - the names of the features to be active in order for <code>func</code> to be
     * invoked (may be <code>null</code>)
     * @param {Function} func - the function to be invoked when all named features are active or <code>names</code> is
     * <code>null</code> or empty
     * @return {Featuring} A reference to this instance for chaining purposes.
     * @public
     * @memberof Featuring#
     */
    self.when = function(names, func) {
      if (typeof names === 'function') {
        func = names;
        names = null;
      }

      if (self.active(names)) {
        func();
      }

      return self;
    };

    /**
     * Invokes the specified function only when <b>any</b> of the named features are active.
     *
     * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including their case.
     *
     * This method is often preferred over using {@link Featuring#anyActive} within an <code>if</code> expression when
     * wrapping large code as it helps to prevent potential scoping issues (e.g. from variable hoisting) and can even be
     * simpler to replace with IIFEs, when taking that route.
     *
     * This method can also be accessed via {@link Featuring#when.any}.
     *
     * @example
     * <pre>
     * var features = require('featuring')([ 'FOO', 'BAR' ]);
     *
     * features.whenAny('FOO', function() {
     *   // ...
     * });
     * features.whenAny('BUZZ', function() {
     *   // Never called
     * });
     * features.whenAny([ 'FOO', 'BAR' ], function() {
     *   // ...
     * });
     * features.whenAny([ 'FOO', 'BUZZ' ], function() {
     *   // ...
     * });
     * features.whenAny([ 'foo', 'bar' ], function() {
     *   // Never called
     * });
     *
     * features.whenAny(null, function() {
     *   // Never called
     * });
     * features.whenAny([], function() {
     *   // Never called
     * });
     * </pre>
     * @param {string|string[]} [names] - the names of the features for which at least one must be active in order for
     * <code>func</code> to be invoked (may be <code>null</code>)
     * @param {Function} func - the function to be invoked when any named feature is active
     * @return {Featuring} A reference to this instance for chaining purposes.
     * @public
     * @memberof Featuring#
     */
    self.whenAny = self.when.any = function(names, func) {
      if (typeof names === 'function') {
        func = names;
        names = null;
      }

      if (self.anyActive(names)) {
        func();
      }

      return self;
    };
  }

  /**
   * Returns whether the feature with the specified <code>name</code> is active within the <code>map</code> provided.
   *
   * @param {Object.<string, boolean>} map - the feature mapping in which <code>name</code> is to be checked
   * @param {string} name - the name of the feature to be checked
   * @return {boolean} <code>true</code> if the named feature is active in <code>map</code>; otherwise <code>false</code>.
   * @private
   */
  function isActive(map, name) {
    return Boolean(map[name]);
  }

  /**
   * Sanitizes the specified feature <code>names</code> so that they can be consumed easily by the API.
   *
   * This method ensures that, regardless of which format <code>names</code> was passed to the API, it will be consumed as
   * an array of strings.
   *
   * @param {?string|string[]} names - the feature names to be sanitized (may be <code>null</code>)
   * @return {string[]} The santized feature <code>names</code>.
   * @private
   */
  function sanitizeNames(names) {
    if (names == null) {
      return [];
    }

    if (typeof names === 'string') {
      return [ names ];
    }

    return names;
  }

  /**
   * Verifies that the feature with the specified <code>name</code> is active within the <code>map</code> provided and
   * throws an error if it is not.
   *
   * @param {Object.<string, boolean>} map - the feature mapping in which <code>name</code> is to be checked
   * @param {string} name - the name of the feature to be verified
   * @return {void}
   * @throws {Error} If the named feature is not active in <code>map</code>.
   * @private
   */
  function verifyActive(map, name) {
    if (!isActive(map, name)) {
      throw new Error('"' + name + '" feature is not active');
    }
  }

  var featuring = Featuring;

  var index = featuring;

  return index;

})));

//# sourceMappingURL=featuring.js.map