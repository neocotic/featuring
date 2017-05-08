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

  /**
   * Contains feature mappings for each initialized scope.
   *
   * A feature mapping won't exist for a scope until {@link featuring.init} is called for it.
   *
   * @private
   * @type {Object.<string, Object.<string, boolean>>}
   */
  var features = {};

  /**
   * Contains all features mapped to the global/shared scope.
   *
   * This will be <code>null</code> until {@link featuring.init} is called without a scope specified (or when it is
   * <code>null</code>).
   *
   * @private
   * @type {?Object.<string, boolean>}
   */
  var globalFeatures = null;

  /**
   * Creates an instance of {@link Feature} for the specified <code>name</code> within the <code>scope</code> provided.
   *
   * <code>name</code> must <b>exactly</b> match that of the known feature, including its case.
   *
   * If <code>scope</code> is <code>null</code> it will default to a global/shared scope and, like <code>name</code>,
   * <code>scope</code> is case sensitive.
   *
   * @param {string} name - the name to be used
   * @param {?string} scope - the scope to be used (may be <code>null</code>, defaults to global/shared)
   * @private
   * @constructor
   */
  function Feature(name, scope) {
    /**
     * The name of this {@link Feature}.
     *
     * @private
     * @type {string}
     * @memberof Feature#
     */
    this._name = name;

    /**
     * The scope of this {@link Feature}.
     *
     * If <code>null</code>, the global/shared scope should be used.
     *
     * @private
     * @type {?string}
     * @memberof Feature#
     */
    this._scope = scope;
  }

  Feature.prototype = {

    constructor: Feature,

    /**
     * Returns whether this {@link Feature} is active within its scope.
     *
     * This method will only return <code>true</code> if the scope for this {@link Feature} has been initialized and
     * contains the name of this {@link Feature}.
     *
     * @example
     * <pre>
     * var featuring = require('featuring');
     *
     * featuring.init([ 'FOO', 'BAR' ], 'example');
     *
     * featuring('FOO', 'example').active();
     * //=> true
     * featuring('BAR', 'example').active();
     * //=> true
     * featuring('foo', 'example').active();
     * //=> false
     * featuring('FOO').active();
     * //=> false
     *
     * featuring.init([ 'FIZZ', 'BUZZ' ]);
     *
     * featuring('FIZZ', 'example').active();
     * //=> false
     * featuring('BUZZ').active();
     * //=> true
     * </pre>
     * @return {boolean} <code>true</code> if this {@link Feature} is active; otherwise <code>false</code>.
     * @public
     * @memberof Feature#
     */
    active: function() {
      var target = getMap(this._scope);

      return Boolean(target && target[this._name]);
    },

    /**
     * Returns a version of this {@link Feature} that is bound to the specified <code>scope</code>.
     *
     * @example
     * <pre>
     * var featuring = require('featuring');
     *
     * featuring.init([ 'FOO', 'BAR' ], 'example');
     *
     * var feature = featuring('FOO');
     *
     * feature.active();
     * //=> false
     * feature.using('example').active();
     * //=> true
     * </pre>
     * @param {?string} scope - the scope to be used (may be <code>null</code>, defaults to global/shared)
     * @return {Feature} A version of this {@link Feature} for <code>scope</code>.
     * @public
     * @memberof Feature#
     */
    using: function(scope) {
      return new Feature(this._name, scope);
    },

    /**
     * Verifies that this {@link Feature} is active within its scope and throws and error if it is not.
     *
     * This method is useful for fail-fast sitations where you simply want your code to break when this {@link Feature} is
     * not active.
     *
     * This {@link Feature} is only considered active if its scope has been initialized and contains its name.
     *
     * @example
     * <pre>
     * var featuring = require('featuring');
     *
     * featuring.init([ 'FOO', 'BAR' ], 'example');
     *
     * featuring('FOO', 'example').verify();
     * try {
     *   featuring('FIZZ', 'example').verify();
     * } catch (error) {
     *   console.error(error);
     *   //=> "Error: "FIZZ" feature in "example" scope is not active"
     * }
     * </pre>
     * @return {Feature} A reference to this {@link Feature} for chaining purposes.
     * @throws {Error} If this {@link Feature} is not active.
     * @public
     * @memberof Feature#
     */
    verify: function() {
      var formattedName, formattedScope;

      if (!this.active()) {
        formattedName = '"' + this._name + '"';
        formattedScope = isString(this._scope) ? '"' + this._scope + '"' : 'global';

        throw new Error(formattedName + ' feature in ' + formattedScope + ' scope is not active');
      }

      return this;
    },

    /**
     * Invokes the specified function only when this {@link Feature} is active within its scope.
     *
     * This method is often preferred over using {@link Feature#active} within an <code>if</code> expression when wrapping
     * large code. It helps prevent potential scoping issues (e.g. from variable hoisting) and can even be simpler to
     * replace with IIFEs, when taking that route.
     *
     * This {@link Feature} is only considered active if its scope has been initialized and contains its name.
     *
     * @example
     * <pre>
     * var featuring = require('featuring');
     *
     * featuring.init([ 'FOO', 'BAR' ], 'example');
     *
     * featuring('FOO', 'example').when(function() {
     *   // ...
     * });
     * featuring('BAR').when(function() {
     *   // Never called
     * });
     * </pre>
     * @param {Function} func - the function to be invoked when this {@link Feature} is active
     * @return {Feature} A reference to this {@link Feature} for chaining purposes.
     * @public
     * @memberof Feature#
     */
    when: function(func) {
      if (this.active()) {
        func();
      }

      return this;
    }

  };

  /**
   * Returns a {@link Feature} for the specified <code>name</code> within the <code>scope</code> provided.
   *
   * <code>name</code> must <b>exactly</b> match that of the known feature, including its case.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. Like <code>name</code>,
   * <code>scope</code> is case sensitive.
   *
   * This method will <i>always</i> return an instance, even if <code>name</code> does not match a known/enabled feature,
   * as it is expected that the methods on the returned {@link Feature} instance will be used to check its state.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   *
   * featuring('FOO', 'example').active();
   * //=> true
   * try {
   *   featuring('foo', 'example').verify();
   * } catch (error) {
   *   console.error(error);
   *   //=> "Error: "foo" feature in "example" scope is not active"
   * }
   * featuring('BAR').when(function() {
   *   // Never called
   * });
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring('FIZZ', 'example').active();
   * //=> false
   * featuring('BUZZ').active();
   * //=> true
   *
   * featuring('BAR').using('example').active();
   * //=> true
   * </pre>
   * @param {string} name - the name of the feature
   * @param {string} [scope] - the scope of the feature (may be <code>null</code>, defaults to global/shared)
   * @return {Feature} A {@link Feature} for <code>name</code> and <code>scope</code>.
   * @public
   */
  function featuring(name, scope) {
    return new Feature(name, scope);
  }

  /**
   * Returns whether <b>all</b> of the named features are active within the specified <code>scope</scope>.
   *
   * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including its case.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. Like <code>names</code>,
   * <code>scope</code> is case sensitive.
   *
   * This method will only return <code>true</code> if <code>scope</code> has been initialized and contains all
   * <code>names</code>.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   *
   * featuring.active('FOO', 'example');
   * //=> true
   * featuring.active([ 'FOO', 'BAR' ], 'example');
   * //=> true
   * featuring.active([ 'FOO', 'BUZZ' ], 'example');
   * //=> false
   * featuring.active([ 'foo', 'bar' ], 'example');
   * //=> false
   * featuring.active('FOO');
   * //=> false
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring.active('FIZZ', 'example');
   * //=> false
   * featuring.active([ 'FIZZ', 'BUZZ' ]);
   * //=> true
   *
   * featuring.active([]);
   * //=> true
   * </pre>
   * @param {string|string[]} names - the names of the features to be checked
   * @param {string} [scope] - the scope in which the features are to be checked (may be <code>null</code>, defaults to
   * global/shared)
   * @return {boolean} <code>true</code> if all of the features are active or <code>names</code> is empty; otherwise
   * <code>false</code>.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.active = function(names, scope) {
    if (isString(names)) {
      names = [ names ];
    }

    return names.every(function(name) {
      var feature = new Feature(name, scope);

      return feature.active();
    });
  };

  /**
   * Returns whether <b>any</b> of the named features are active within the specified <code>scope</scope>.
   *
   * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including its case.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. Like <code>names</code>,
   * <code>scope</code> is case sensitive.
   *
   * This method will return <code>true</code> if <code>scope</code> has been initialized and contains at least one of
   * <code>names</code>.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   *
   * featuring.active.any('FOO', 'example');
   * //=> true
   * featuring.active.any([ 'FOO', 'BAR' ], 'example');
   * //=> true
   * featuring.active.any([ 'FOO', 'BUZZ' ], 'example');
   * //=> true
   * featuring.active.any([ 'foo', 'bar' ], 'example');
   * //=> false
   * featuring.active.any('FOO');
   * //=> false
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring.active.any('FIZZ', 'example');
   * //=> false
   * featuring.active.any([ 'FIZZ', 'BUZZ' ]);
   * //=> true
   *
   * featuring.active.any([]);
   * //=> false
   * </pre>
   * @param {string|string[]} names - the names of the features to be checked
   * @param {string} [scope] - the scope in which the features are to be checked (may be <code>null</code>, defaults to
   * global/shared)
   * @return {boolean} <code>true</code> if any of the features are active; otherwise <code>false</code>.
   * @public
   * @static
   * @memberof featuring.active
   */
  featuring.active.any = function(names, scope) {
    if (isString(names)) {
      names = [ names ];
    }

    return names.some(function(name) {
      var feature = new Feature(name, scope);

      return feature.active();
    });
  };

  /**
   * An alias for the {@link featuring.active.any} method.
   *
   * @param {string|string[]} names - the names of the features to be checked
   * @param {string} [scope] - the scope in which the features are to be checked (may be <code>null</code>, defaults to
   * global/shared)
   * @return {boolean} <code>true</code> if any of the features are active; otherwise <code>false</code>.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.anyActive = featuring.active.any;

  /**
   * Returns the names of all of the active features within the specified <code>scope</scope>.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. <code>scope</code> is case
   * sensitive.
   *
   * This method will only return the names of features that are activie within <code>scope</code> if it has been
   * initialized. Otherwise, the returned array will be empty. It is not guaranteed that the feature names will be
   * returned in the same order in which they were passed to {@link featuring.init}.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.get('example');
   * //=> []
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   *
   * featuring.get('example');
   * //=> [ "FOO", "BAR" ]
   * featuring.get();
   * //=> []
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring.get();
   * //=> [ "FIZZ", "BUZZ" ]
   * </pre>
   * @param {string} [scope] - the scope for which the names of all active features are to be returned (may be
   * <code>null</code>, defaults to global/shared)
   * @return {string[]} The names of all features active within <code>scope</code>.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.get = function(scope) {
    var target = getMap(scope);

    return target ? getNames(target) : [];
  };

  /**
   * Initializes the specified <code>scope</code> with all of the named features.
   *
   * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including its case.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. Like <code>names</code>,
   * <code>scope</code> is case sensitive.
   *
   * Obviously, this method should really be called before other methods, however, it can only be called once per scope.
   * Any attempts to initialize the same scope more than once will result in an error being thrown. This is done to
   * protect the immutability of the library. It's possible to check whether a scope has already been initialized via
   * {@link featuring.initialized}, if required to do so.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.active('FOO', 'example');
   * //=> false
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   * try {
   *   featuring.init([ 'FIZZ', 'BUZZ' ], 'example');
   * } catch (error) {
   *   console.error(error);
   *   //=> "Error: "example" scope features have already been initialized"
   * }
   *
   * featuring.active([ 'FOO', 'BAR' ], 'example');
   * //=> true
   *
   * featuring.active('FIZZ');
   * //=> false
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   * try {
   *   featuring.init([ 'FOO', 'BAR' ]);
   * } catch (error) {
   *   console.error(error);
   *   //=> "Error: Global features have already been initialized"
   * }
   *
   * featuring.active([ 'FIZZ', 'BUZZ' ]);
   * //=> true
   * </pre>
   * @param {string|string[]} names - the name of the features to be activated
   * @param {string} [scope] - the scope to be initialized with the active features (may be <code>null</code>, defaults to
   * global/shared)
   * @return {Function} A reference to {@link featuring} for chaining purposes.
   * @throws {Error} If the features for <code>scope</code> have already been initialized.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.init = function(names, scope) {
    if (isString(scope)) {
      if (features[scope]) {
        throw new Error('"' + scope + '" scope features have already been initialized');
      }

      features[scope] = createMap(names);
    } else {
      if (globalFeatures) {
        throw new Error('Global features have already been initialized');
      }

      globalFeatures = createMap(names);
    }

    return featuring;
  };

  /**
   * Returns whether features for the specified <code>scope</code> have been initialized.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. <code>scope</code> is case
   * sensitive.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.initialized('example');
   * //=> false
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   *
   * featuring.initialized('example');
   * //=> true
   * featuring.initialized();
   * //=> false
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring.initialized();
   * //=> true
   * </pre>
   * @param {string} [scope] - the scope to be checked (may be <code>null</code>, defaults to global/shared)
   * @return {boolean} <code>true</code> if <code>scope</code> has been initialized; otherwise <code>false</code>.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.initialized = function(scope) {
    return getMap(scope) != null;
  };

  /**
   * Returns a version of {@link featuring} that is bound (along with <i>all</i> of its methods) to the specified
   * <code>scope</code>.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code>. This method makes it super easy to do this so that applications are
   * free to use the global scope freely, unless a library/framework plans to package the featuring library within their
   * own distribution bundle so that it's only used by themselves. <code>scope</code> is case sensitive.
   *
   * Any scope passed to the methods within the returned wrapped API will be ignored in favor of <code>scope</code>.
   *
   * @example
   * <pre>
   * var featuring = require('featuring').using('example');
   *
   * featuring.init([ 'FOO', 'BAR' ]);
   *
   * featuring.initialized();
   * //=> true
   * featuring('FOO').active();
   * //=> true
   * featuring.active([ 'FOO', 'BAR' ]);
   * //=> true
   * featuring.get();
   * //=> [ "FOO", "BAR" ]
   * featuring.verify([ 'FOO', 'BAR' ]);
   * featuring.when('BAR', function() {
   *   // ...
   * });
   * </pre>
   * @param {?string} scope - the scope to be used (may be <code>null</code>, defaults to global/shared)
   * @return {Function} A version of {@link featuring} that will, along with its methods, always use <code>scope</code>.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.using = function(scope) {
    var boundFeaturing = applyScope(featuring, scope);
    applyScopeToAll(featuring, boundFeaturing, [
      'active',
      'anyActive',
      'get',
      'init',
      'initialized',
      'verify',
      'verifyAny',
      'when',
      'whenAny'
    ], scope);

    boundFeaturing.active.any = boundFeaturing.anyActive;
    boundFeaturing.using = featuring.using;
    boundFeaturing.verify.any = boundFeaturing.verifyAny;
    boundFeaturing.when.any = boundFeaturing.whenAny;

    return boundFeaturing;
  };

  /**
   * Verifies that <b>all</b> of the named features are active within the specified <code>scope</code> and throws and
   * error if they are not.
   *
   * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including its case.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. Like <code>names</code>,
   * <code>scope</code> is case sensitive.
   *
   * This method is useful for fail-fast sitations where you simply want your code to break when the named features are
   * not active.
   *
   * This method will throw an error unless <code>scope</code> has been initialized and contains all <code>names</code>.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   *
   * featuring.verify('FOO', 'example');
   * featuring.verify([ 'FOO', 'BAR' ], 'example');
   * try {
   *   featuring.verify([ 'FOO', 'BUZZ' ], 'example');
   * } catch (error) {
   *   console.error(error);
   *   //=> "Error: "BUZZ" feature in "example" scope is not active"
   * }
   * try {
   *   featuring.verify([ 'foo', 'bar' ], 'example');
   * } catch (error) {
   *   console.error(error);
   *   //=> "Error: "foo" feature in "example" scope is not active"
   * }
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring.verify([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring.verify([]);
   * </pre>
   * @param {string|string[]} names - the names of the features to be verified
   * @param {string} [scope] - the scope in which the features are to be verified (may be <code>null</code>, defaults to
   * global/shared)
   * @return {Function} A reference to {@link featuring} for chaining purposes.
   * @throws {Error} If any of the named features are not active.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.verify = function(names, scope) {
    if (isString(names)) {
      names = [ names ];
    }

    names.forEach(function(name) {
      var feature = new Feature(name, scope);
      feature.verify();
    });

    return featuring;
  };

  /**
   * Verifies that <b>any</b> of the named features are active within the specified <code>scope</code> and throws and
   * error if this is not the case.
   *
   * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including its case.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. Like <code>names</code>,
   * <code>scope</code> is case sensitive.
   *
   * This method is useful for fail-fast sitations where you simply want your code to break when none of the named
   * features are active.
   *
   * This method will throw an error unless <code>scope</code> has been initialized and contains at least one of
   * <code>names</code>.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   *
   * featuring.verify.any('FOO', 'example');
   * featuring.verify.any([ 'FOO', 'BAR' ], 'example');
   * featuring.verify.any([ 'FOO', 'BUZZ' ], 'example');
   * try {
   *   featuring.verify.any([ 'foo', 'bar' ], 'example');
   * } catch (error) {
   *   console.error(error);
   *   //=> "Error: No named features in "example" scope are active"
   * }
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring.verify.any([ 'FIZZ', 'BUZZ' ]);
   *
   * try {
   *   featuring.verify.any([]);
   * } catch (error) {
   *   console.error(error);
   *   //=> "Error: No named features in global scope are active"
   * }
   * </pre>
   * @param {string|string[]} names - the names of the features to be verified
   * @param {string} [scope] - the scope in which the features are to be verified (may be <code>null</code>, defaults to
   * global/shared)
   * @return {Function} A reference to {@link featuring} for chaining purposes.
   * @throws {Error} If all of the named features are not active.
   * @public
   * @static
   * @memberof featuring.verify
   */
  featuring.verify.any = function(names, scope) {
    if (featuring.active.any(names, scope)) {
      return featuring;
    }

    var formattedScope = isString(scope) ? '"' + scope + '"' : 'global';

    throw new Error('No named features in ' + formattedScope + ' scope are active');
  };

  /**
   * An alias for the {@link featuring.verify.any} method.
   *
   * @param {string|string[]} names - the names of the features to be verified
   * @param {string} [scope] - the scope in which the features are to be verified (may be <code>null</code>, defaults to
   * global/shared)
   * @return {Function} A reference to {@link featuring} for chaining purposes.
   * @throws {Error} If all of the named features are not active.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.verifyAny = featuring.verify.any;

  /**
   * Invokes the specified function only when <b>all</b> of the named features are active within the specified
   * <code>scope</code>.
   *
   * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including its case.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. Like <code>names</code>,
   * <code>scope</code> is case sensitive.
   *
   * This method is often preferred over using {@link featuring.active} within an <code>if</code> expression when wrapping
   * large code. It helps prevent potential scoping issues (e.g. from variable hoisting) and can even be simpler to
   * replace with IIFEs, when taking that route.
   *
   * This method will only invoke <code>func</code> if <code>scope</code> has been initialized and contains all
   * <code>names</code>.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   *
   * featuring.when('FOO', 'example', function() {
   *   // ...
   * });
   * featuring.when([ 'FOO', 'BAR' ], 'example', function() {
   *   // ...
   * });
   * featuring.when([ 'FOO', 'BUZZ' ], 'example', function() {
   *   // Never called
   * });
   * featuring.when([ 'foo', 'bar' ], 'example', function() {
   *   // Never called
   * });
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring.when([ 'FIZZ', 'BUZZ' ], function() {
   *   // ...
   * });
   *
   * featuring.when([], function() {
   *   // ...
   * });
   * </pre>
   * @param {string|string[]} names - the names of the features to be active in order for <code>func</code> to be invoked
   * @param {string} [scope] - the scope in which the features are to be checked (may be <code>null</code>, defaults to
   * global/shared)
   * @param {Function} func - the function to be invoked when all named features are active or <code>names</code> is
   * empty.
   * @return {Function} A reference to {@link featuring} for chaining purposes.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.when = function(names, scope, func) {
    if (isFunction(scope)) {
      func = scope;
      scope = null;
    }

    if (featuring.active(names, scope)) {
      func();
    }

    return featuring;
  };

  /**
   * Invokes the specified function only when <b>any</b> of the named features are active within the specified
   * <code>scope</code>.
   *
   * Each item within <code>names</code> must <b>exactly</b> match that of the known feature, including its case.
   *
   * <code>scope</code> is optional and will default to a global/shared scope, however, it is recommended that libraries
   * and frameworks always specify <code>scope</code> (which couldn't be easier via {@link featuring.using}) so that
   * applications are free to use the global scope freely, unless a library/framework plans to package the featuring
   * library within their own distribution bundle so that it's only used by themselves. Like <code>names</code>,
   * <code>scope</code> is case sensitive.
   *
   * This method is often preferred over using {@link featuring.active.any} within an <code>if</code> expression when
   * wrapping large code. It helps prevent potential scoping issues (e.g. from variable hoisting) and can even be simpler
   * to replace with IIFEs, when taking that route.
   *
   * This method will only invoke <code>func</code> if <code>scope</code> has been initialized and contains at least one
   * of <code>names</code>.
   *
   * @example
   * <pre>
   * var featuring = require('featuring');
   *
   * featuring.init([ 'FOO', 'BAR' ], 'example');
   *
   * featuring.when.any('FOO', 'example', function() {
   *   // ...
   * });
   * featuring.when.any([ 'FOO', 'BAR' ], 'example', function() {
   *   // ...
   * });
   * featuring.when.any([ 'FOO', 'BUZZ' ], 'example', function() {
   *   // ...
   * });
   * featuring.when.any([ 'foo', 'bar' ], 'example', function() {
   *   // Never called
   * });
   *
   * featuring.init([ 'FIZZ', 'BUZZ' ]);
   *
   * featuring.when.any([ 'FIZZ', 'BUZZ' ], function() {
   *   // ...
   * });
   *
   * featuring.when.any([], function() {
   *   // Never called
   * });
   * </pre>
   * @param {string|string[]} names - the names of the features for which at least one must be active in order for
   * <code>func</code> to be invoked
   * @param {string} [scope] - the scope in which the features are to be checked (may be <code>null</code>, defaults to
   * global/shared)
   * @param {Function} func - the function to be invoked when any named feature is active.
   * @return {Function} A reference to {@link featuring} for chaining purposes.
   * @public
   * @static
   * @memberof featuring.when
   */
  featuring.when.any = function(names, scope, func) {
    if (isFunction(scope)) {
      func = scope;
      scope = null;
    }

    if (featuring.active.any(names, scope)) {
      func();
    }

    return featuring;
  };

  /**
   * An alias for the {@link featuring.when.any} method.
   *
   * @param {string|string[]} names - the names of the features for which at least one must be active in order for
   * <code>func</code> to be invoked
   * @param {string} [scope] - the scope in which the features are to be checked (may be <code>null</code>, defaults to
   * global/shared)
   * @param {Function} func - the function to be invoked when any named feature is active.
   * @return {Function} A reference to {@link featuring} for chaining purposes.
   * @public
   * @static
   * @memberof featuring
   */
  featuring.whenAny = featuring.when.any;

  /**
   * Returns a function that delegates the call to the specified <code>func</code> so that the <code>scope</code>
   * provided is always passed to it.
   *
   * The returned function will always return the return value of calling <code>func</code>.
   *
   * @param {Function} func - the function to which <code>scope</code> is to be applied
   * @param {?string} scope - the scope to be applied (may be <code>null</code>, defaults to global/shared)
   * @return {Function} A function which will always pass <code>scope</code> as the appropriate argument to
   * <code>func</code>.
   * @private
   */
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

  /**
   * Assigns functions to the specified <code>target</code> for all of the <code>names</code> provided that delegate their
   * calls to the function of the same name on the given <code>source</code> so that the <code>scope</code> provided is
   * always passed to them.
   *
   * Each proxy function will always return the return value of calling the original function.
   *
   * @param {Object} source - the object on which the original functions belong
   * @param {Object} target - the object to which the proxy functions are to be assigned
   * @param {string[]} names - the names of each function to be proxied
   * @param {?string} scope - the scope to be used (may be <code>null</code>, defaults to global/shared)
   * @return {void}
   * @private
   */
  function applyScopeToAll(source, target, names, scope) {
    names.forEach(function(name) {
      target[name] = applyScope(source[name], scope);
    });
  }

  /**
   * Returns a feature mapping consisting of the specified <code>names</code>.
   *
   * This method simply constructs an object contain a property for each of the feature <code>names</code> whose value is
   * always <code>true</code>.
   *
   * The mapping is used instead of just array itself as hash lookups are much faster than searching arrays.
   *
   * @param {string|string[]} names - the names of all features to be included within the mapping
   * @return {Object.<string, boolean>} The feature mapping containing <code>names</code>.
   * @private
   */
  function createMap(names) {
    if (isString(names)) {
      names = [ names ];
    }

    var map = {};

    names.forEach(function(name) {
      map[name] = true;
    });

    return map;
  }

  /**
   * Returns the appropriate feature mapping for the <code>scope</code> provided.
   *
   * If <code>scope</code> is <code>null</code>, this method will return the global/shared scope. Otherwise, it will
   * return the feature mapping for <code>scope</scope>.
   *
   * This method will return <code>null</code> if the target feature mapping has not been initialized.
   *
   * @param {?string} scope - the scope whose feature mapping is to be returned (may be <code>null</code> for
   * global/shared scope feature mapping)
   * @return {?Object.<string, boolean>} The feature mapping for <code>scope</code> or <code>null</code> if it has not
   * been initialized.
   * @private
   */
  function getMap(scope) {
    return isString(scope) ? features[scope] : globalFeatures;
  }

  /**
   * Returns the names of the features within the specifed <code>map</code>.
   *
   * This method simply reduces <code>map</code> to an array of all enumeral own property names.
   *
   * @param {Object.<string, boolean>} map - the mapping whose feature names are to be returned
   * @return {string[]} The names of all features within <code>map</code>.
   * @private
   */
  function getNames(map) {
    var names = [];

    for (var key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        names.push(key);
      }
    }

    return names;
  }

  /**
   * Returns whether the specified object is a function.
   *
   * @param {*} obj - the object to be checked
   * @return {boolean} <code>true</code> if <code>obj</code> is a function; otherwise <code>false</code>.
   * @private
   */
  function isFunction(obj) {
    return typeof obj === 'function';
  }

  /**
   * Returns whether the specified object is a string.
   *
   * @param {*} obj - the object to be checked
   * @return {boolean} <code>true</code> if <code>obj</code> is a string; otherwise <code>false</code>.
   * @private
   */
  function isString(obj) {
    return typeof obj === 'string';
  }

  var featuring_1 = featuring;

  var index = featuring_1;

  return index;

})));

//# sourceMappingURL=featuring.js.map