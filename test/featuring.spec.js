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

'use strict';

var assert = require('assert');
var sinon = require('sinon');

var featuring = require('../src/featuring');

describe('featuring', function() {
  var features, testNamesActive, testNamesAll, testNamesInactive;

  beforeEach(function() {
    testNamesActive = [ 'FOO', 'BAR' ];
    testNamesInactive = [ 'FIZZ', 'BUZZ' ];
    testNamesAll = testNamesActive.concat(testNamesInactive);

    features = featuring(testNamesActive);
  });

  it('should return an instance', function() {
    assert.ok(features instanceof featuring);
  });

  it('should be a constructor', function() {
    /* eslint-disable new-cap */
    features = new featuring(testNamesActive);
    /* eslint-enable new-cap */

    assert.ok(features instanceof featuring);
  });

  it('should be immutable', function() {
    testNamesActive.shift();
    testNamesActive.push('FIZZ');

    assert.ok(features.active('FOO'));
    assert.deepEqual(features.get(), [ 'FOO', 'BAR' ]);
    assert.ok(!features.active('FIZZ'));
  });

  context('when features is an empty array', function() {
    it('should contain no features', function() {
      features = featuring([]);

      assert.ok(!features.active(testNamesActive[0]));
      assert.deepEqual(features.get(), []);
    });
  });

  context('when features is a string', function() {
    it('should contain a single feature', function() {
      var testName = testNamesActive[0];
      features = featuring(testName);

      assert.ok(features.active(testName));
      assert.deepEqual(features.get(), [ testName ]);
    });
  });

  context('when features is null', function() {
    it('should contain no features', function() {
      features = featuring(null);

      assert.ok(!features.active(testNamesActive[0]));
      assert.deepEqual(features.get(), []);
    });
  });

  describe('#active', function() {
    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        assert.ok(!features.active(name));
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      assert.ok(!features.active(testNames));
    });

    it('should return whether all named features are active', function() {
      testNamesActive.forEach(function(name) {
        assert.ok(features.active(name));
      });
      testNamesInactive.forEach(function(name) {
        assert.ok(!features.active(name));
      });

      assert.ok(features.active(testNamesActive));
      assert.ok(!features.active(testNamesInactive));
      assert.ok(!features.active(testNamesAll));
    });

    context('when names is an empty array', function() {
      it('should always return true', function() {
        assert.ok(features.active([]));
      });
    });

    context('when names is null', function() {
      it('should always return true', function() {
        assert.ok(features.active(null));
      });
    });

    describe('.any', function() {
      it('should be an alias for Featuring#anyActive', function() {
        assert.strictEqual(features.active.any, features.anyActive);
      });
    });
  });

  describe('#anyActive', function() {
    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        assert.ok(!features.anyActive(name));
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      assert.ok(!features.anyActive(testNames));
    });

    it('should return whether any named feature is active', function() {
      testNamesActive.forEach(function(name) {
        assert.ok(features.anyActive(name));
      });
      testNamesInactive.forEach(function(name) {
        assert.ok(!features.anyActive(name));
      });

      assert.ok(features.anyActive(testNamesActive));
      assert.ok(!features.anyActive(testNamesInactive));
      assert.ok(features.anyActive(testNamesAll));
    });

    context('when names is an empty array', function() {
      it('should always return false', function() {
        assert.ok(!features.anyActive([]));
      });
    });

    context('when names is null', function() {
      it('should always return false', function() {
        assert.ok(!features.anyActive(null));
      });
    });
  });

  describe('#get', function() {
    it('should return names of all active features', function() {
      assert.deepEqual(features.get(), testNamesActive);
    });

    context('when there are no active features', function() {
      it('should return an empty array', function() {
        features = featuring([]);

        assert.deepEqual(features.get(), []);
      });
    });
  });

  describe('#verify', function() {
    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        assert.throws(
          function() {
            features.verify(name);
          },
          function(error) {
            return error instanceof Error && error.message === getVerifyErrorMessage(name);
          }
        );
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      assert.throws(
        function() {
          features.verify(testNames);
        },
        function(error) {
          return error instanceof Error && error.message === getVerifyErrorMessage(testNames[0]);
        }
      );
    });

    it('should return reference to instance', function() {
      assert.strictEqual(features.verify(testNamesActive), features);
    });

    it('should throw an error if any named feature is not active', function() {
      testNamesActive.forEach(function(name) {
        assert.doesNotThrow(
          function() {
            features.verify(name);
          },
          Error
        );
      });
      testNamesInactive.forEach(function(name) {
        assert.throws(
          function() {
            features.verify(name);
          },
          function(error) {
            return error instanceof Error && error.message === getVerifyErrorMessage(name);
          }
        );
      });

      assert.doesNotThrow(
        function() {
          features.verify(testNamesActive);
        },
        Error
      );
      assert.throws(
        function() {
          features.verify(testNamesInactive);
        },
        function(error) {
          return error instanceof Error && error.message === getVerifyErrorMessage(testNamesInactive[0]);
        }
      );
      assert.throws(
        function() {
          features.verify(testNamesAll);
        },
        function(error) {
          return error instanceof Error && error.message === getVerifyErrorMessage(testNamesInactive[0]);
        }
      );
    });

    context('when names is an empty array', function() {
      it('should never throw an error', function() {
        assert.doesNotThrow(
          function() {
            features.verify([]);
          },
          Error
        );
      });
    });

    context('when names is null', function() {
      it('should never throw an error', function() {
        assert.doesNotThrow(
          function() {
            features.verify(null);
          },
          Error
        );
      });
    });

    describe('.any', function() {
      it('should be an alias for Featuring#verifyAny', function() {
        assert.strictEqual(features.verify.any, features.verifyAny);
      });
    });
  });

  describe('#verifyAny', function() {
    var verifyAnyErrorMessage = 'All named features are not active';

    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        assert.throws(
          function() {
            features.verifyAny(name);
          },
          function(error) {
            return error instanceof Error && error.message === verifyAnyErrorMessage;
          }
        );
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      assert.throws(
        function() {
          features.verifyAny(testNames);
        },
        function(error) {
          return error instanceof Error && error.message === verifyAnyErrorMessage;
        }
      );
    });

    it('should return reference to instance', function() {
      assert.strictEqual(features.verifyAny(testNamesActive), features);
    });

    it('should throw an error if all named features are not active', function() {
      testNamesActive.forEach(function(name) {
        assert.doesNotThrow(
          function() {
            features.verifyAny(name);
          },
          Error
        );
      });
      testNamesInactive.forEach(function(name) {
        assert.throws(
          function() {
            features.verifyAny(name);
          },
          function(error) {
            return error instanceof Error && error.message === verifyAnyErrorMessage;
          }
        );
      });

      assert.doesNotThrow(
        function() {
          features.verifyAny(testNamesActive);
        },
        Error
      );
      assert.throws(
        function() {
          features.verifyAny(testNamesInactive);
        },
        function(error) {
          return error instanceof Error && error.message === verifyAnyErrorMessage;
        }
      );
      assert.doesNotThrow(
        function() {
          features.verifyAny(testNamesAll);
        },
        Error
      );
    });

    context('when names is an empty array', function() {
      it('should always throw an error', function() {
        assert.throws(
          function() {
            features.verifyAny([]);
          },
          function(error) {
            return error instanceof Error && error.message === verifyAnyErrorMessage;
          }
        );
      });
    });

    context('when names is null', function() {
      it('should always throw an error', function() {
        assert.throws(
          function() {
            features.verifyAny(null);
          },
          function(error) {
            return error instanceof Error && error.message === verifyAnyErrorMessage;
          }
        );
      });
    });
  });

  describe('#when', function() {
    var callback;

    beforeEach(function() {
      callback = sinon.stub();
    });

    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        features.when(name, callback);
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      features.when(testNames, callback);

      assert.ok(!callback.called);
    });

    it('should return reference to instance', function() {
      assert.strictEqual(features.when(testNamesActive, callback), features);
    });

    it('should invoke function when all named features are active', function() {
      testNamesActive.forEach(function(name) {
        features.when(name, callback);
      });

      assert.equal(callback.callCount, testNamesActive.length);
      callback.reset();

      testNamesInactive.forEach(function(name) {
        features.when(name, callback);
      });

      assert.ok(!callback.called);
      callback.reset();

      features.when(testNamesActive, callback);

      assert.ok(callback.calledOnce);
      callback.reset();

      features.when(testNamesInactive, callback);
      features.when(testNamesAll, callback);

      assert.ok(!callback.called);
    });

    context('when names is an empty array', function() {
      it('should always invoke function', function() {
        features.when([], callback);

        assert.ok(callback.calledOnce);
      });
    });

    context('when names is not specifed', function() {
      it('should always invoke function', function() {
        features.when(callback);

        assert.ok(callback.calledOnce);
      });
    });

    context('when names is null', function() {
      it('should always invoke function', function() {
        features.when(null, callback);

        assert.ok(callback.calledOnce);
      });
    });

    describe('.any', function() {
      it('should be an alias for Featuring#whenAny', function() {
        assert.strictEqual(features.when.any, features.whenAny);
      });
    });
  });

  describe('#whenAny', function() {
    var callback;

    beforeEach(function() {
      callback = sinon.stub();
    });

    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        features.whenAny(name, callback);
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      features.whenAny(testNames, callback);

      assert.ok(!callback.called);
    });

    it('should return reference to instance', function() {
      assert.strictEqual(features.whenAny(testNamesActive, callback), features);
    });

    it('should invoke function when any named feature is active', function() {
      testNamesActive.forEach(function(name) {
        features.whenAny(name, callback);
      });

      assert.equal(callback.callCount, testNamesActive.length);
      callback.reset();

      testNamesInactive.forEach(function(name) {
        features.whenAny(name, callback);
      });

      assert.ok(!callback.called);
      callback.reset();

      features.whenAny(testNamesActive, callback);

      assert.ok(callback.calledOnce);
      callback.reset();

      features.whenAny(testNamesInactive, callback);

      assert.ok(!callback.called);
      callback.reset();

      features.whenAny(testNamesAll, callback);

      assert.ok(callback.calledOnce);
    });

    context('when names is an empty array', function() {
      it('should never invoke function', function() {
        features.whenAny([], callback);

        assert.ok(!callback.called);
      });
    });

    context('when names is not specifed', function() {
      it('should never invoke function', function() {
        features.whenAny(callback);

        assert.ok(!callback.called);
      });
    });

    context('when names is null', function() {
      it('should never invoke function', function() {
        features.whenAny(null, callback);

        assert.ok(!callback.called);
      });
    });
  });

  function getVerifyErrorMessage(name) {
    return '"' + name + '" feature is not active';
  }
});
