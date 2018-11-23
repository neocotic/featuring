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

var expect = require('chai').expect;
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
    expect(features).to.be.an.instanceof(featuring);
  });

  it('should be a constructor', function() {
    /* eslint-disable new-cap */
    features = new featuring(testNamesActive);
    /* eslint-enable new-cap */

    expect(features).to.be.an.instanceof(featuring);
  });

  it('should be immutable', function() {
    testNamesActive.shift();
    testNamesActive.push('FIZZ');

    expect(features.active('FOO')).to.be.true;
    expect(features.get()).to.eql([ 'FOO', 'BAR' ]);
    expect(features.active('FIZZ')).to.be.false;
  });

  context('when features is an empty array', function() {
    it('should contain no features', function() {
      features = featuring([]);

      expect(features.active(testNamesActive[0])).to.be.false;
      expect(features.get()).to.eql([]);
    });
  });

  context('when features is a string', function() {
    it('should contain a single feature', function() {
      var testName = testNamesActive[0];
      features = featuring(testName);

      expect(features.active(testName)).to.be.true;
      expect(features.get()).to.eql([ testName ]);
    });
  });

  context('when features is null', function() {
    it('should contain no features', function() {
      features = featuring(null);

      expect(features.active(testNamesActive[0])).to.be.false;
      expect(features.get()).to.eql([]);
    });
  });

  describe('#active', function() {
    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        expect(features.active(name)).to.be.false;
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      expect(features.active(testNames)).to.be.false;
    });

    it('should return whether all named features are active', function() {
      testNamesActive.forEach(function(name) {
        expect(features.active(name)).to.be.true;
      });
      testNamesInactive.forEach(function(name) {
        expect(features.active(name)).to.be.false;
      });

      expect(features.active(testNamesActive)).to.be.true;
      expect(features.active(testNamesInactive)).to.be.false;
      expect(features.active(testNamesAll)).to.be.false;
    });

    context('when names is an empty array', function() {
      it('should always return true', function() {
        expect(features.active([])).to.be.true;
      });
    });

    context('when names is null', function() {
      it('should always return true', function() {
        expect(features.active(null)).to.be.true;
      });
    });

    describe('.any', function() {
      it('should be an alias for Featuring#anyActive', function() {
        expect(features.active.any).to.equal(features.anyActive);
      });
    });
  });

  describe('#anyActive', function() {
    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        expect(features.anyActive(name)).to.be.false;
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      expect(features.anyActive(testNames)).to.be.false;
    });

    it('should return whether any named feature is active', function() {
      testNamesActive.forEach(function(name) {
        expect(features.anyActive(name)).to.be.true;
      });
      testNamesInactive.forEach(function(name) {
        expect(features.anyActive(name)).to.be.false;
      });

      expect(features.anyActive(testNamesActive)).to.be.true;
      expect(features.anyActive(testNamesInactive)).to.be.false;
      expect(features.anyActive(testNamesAll)).to.be.true;
    });

    context('when names is an empty array', function() {
      it('should always return false', function() {
        expect(features.anyActive([])).to.be.false;
      });
    });

    context('when names is null', function() {
      it('should always return false', function() {
        expect(features.anyActive(null)).to.be.false;
      });
    });
  });

  describe('#get', function() {
    it('should return names of all active features', function() {
      expect(features.get()).to.eql(testNamesActive);
    });

    context('when there are no active features', function() {
      it('should return an empty array', function() {
        features = featuring([]);

        expect(features.get()).to.eql([]);
      });
    });
  });

  describe('#verify', function() {
    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        expect(function() {
          features.verify(name);
        }).to.throw(Error, getVerifyErrorMessage(name));
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      expect(function() {
        features.verify(testNames);
      }).to.throw(Error, getVerifyErrorMessage(testNames[0]));
    });

    it('should return reference to instance', function() {
      expect(features.verify(testNamesActive)).to.equal(features);
    });

    it('should throw an error if any named feature is not active', function() {
      testNamesActive.forEach(function(name) {
        expect(function() {
          features.verify(name);
        }).to.not.throw(Error, getVerifyErrorMessage(name));
      });
      testNamesInactive.forEach(function(name) {
        expect(function() {
          features.verify(name);
        }).to.throw(Error, getVerifyErrorMessage(name));
      });

      expect(function() {
        features.verify(testNamesActive);
      }).to.not.throw(Error);
      expect(function() {
        features.verify(testNamesInactive);
      }).to.throw(Error, getVerifyErrorMessage(testNamesInactive[0]));
      expect(function() {
        features.verify(testNamesAll);
      }).to.throw(Error, getVerifyErrorMessage(testNamesInactive[0]));
    });

    context('when names is an empty array', function() {
      it('should never throw an error', function() {
        expect(function() {
          features.verify([]);
        }).to.not.throw(Error);
      });
    });

    context('when names is null', function() {
      it('should never throw an error', function() {
        expect(function() {
          features.verify(null);
        }).to.not.throw(Error);
      });
    });

    describe('.any', function() {
      it('should be an alias for Featuring#verifyAny', function() {
        expect(features.verify.any).to.equal(features.verifyAny);
      });
    });
  });

  describe('#verifyAny', function() {
    var verifyAnyErrorMessage = 'All named features are not active';

    it('should be case sensitive', function() {
      testNamesActive.forEach(function(name) {
        name = name.toLowerCase();

        expect(function() {
          features.verifyAny(name);
        }).to.throw(Error, verifyAnyErrorMessage);
      });

      var testNames = testNamesActive.map(function(name) {
        return name.toLowerCase();
      });

      expect(function() {
        features.verifyAny(testNames);
      }).to.throw(Error, verifyAnyErrorMessage);
    });

    it('should return reference to instance', function() {
      expect(features.verifyAny(testNamesActive)).to.equal(features);
    });

    it('should throw an error if all named features are not active', function() {
      testNamesActive.forEach(function(name) {
        expect(function() {
          features.verifyAny(name);
        }).to.not.throw(Error, verifyAnyErrorMessage);
      });
      testNamesInactive.forEach(function(name) {
        expect(function() {
          features.verifyAny(name);
        }).to.throw(Error, verifyAnyErrorMessage);
      });

      expect(function() {
        features.verifyAny(testNamesActive);
      }).to.not.throw(Error, verifyAnyErrorMessage);
      expect(function() {
        features.verifyAny(testNamesInactive);
      }).to.throw(Error, verifyAnyErrorMessage);
      expect(function() {
        features.verifyAny(testNamesAll);
      }).to.not.throw(Error, verifyAnyErrorMessage);
    });

    context('when names is an empty array', function() {
      it('should always throw an error', function() {
        expect(function() {
          features.verifyAny([]);
        }).to.throw(Error, verifyAnyErrorMessage);
      });
    });

    context('when names is null', function() {
      it('should always throw an error', function() {
        expect(function() {
          features.verifyAny(null);
        }).to.throw(Error, verifyAnyErrorMessage);
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

      expect(callback.called).to.be.false;
    });

    it('should return reference to instance', function() {
      expect(features.when(testNamesActive, callback)).to.equal(features);
    });

    it('should invoke function when all named features are active', function() {
      testNamesActive.forEach(function(name) {
        features.when(name, callback);
      });

      expect(callback.callCount).to.equal(testNamesActive.length);
      callback.reset();

      testNamesInactive.forEach(function(name) {
        features.when(name, callback);
      });

      expect(callback.called).to.be.false;
      callback.reset();

      features.when(testNamesActive, callback);

      expect(callback.calledOnce).to.be.true;
      callback.reset();

      features.when(testNamesInactive, callback);
      features.when(testNamesAll, callback);

      expect(callback.called).to.be.false;
    });

    context('when names is an empty array', function() {
      it('should always invoke function', function() {
        features.when([], callback);

        expect(callback.calledOnce).to.be.true;
      });
    });

    context('when names is not specifed', function() {
      it('should always invoke function', function() {
        features.when(callback);

        expect(callback.calledOnce).to.be.true;
      });
    });

    context('when names is null', function() {
      it('should always invoke function', function() {
        features.when(null, callback);

        expect(callback.calledOnce).to.be.true;
      });
    });

    describe('.any', function() {
      it('should be an alias for Featuring#whenAny', function() {
        expect(features.when.any).to.equal(features.whenAny);
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

      expect(callback.called).to.be.false;
    });

    it('should return reference to instance', function() {
      expect(features.whenAny(testNamesActive, callback)).to.equal(features);
    });

    it('should invoke function when any named feature is active', function() {
      testNamesActive.forEach(function(name) {
        features.whenAny(name, callback);
      });

      expect(callback.callCount).to.equal(testNamesActive.length);
      callback.reset();

      testNamesInactive.forEach(function(name) {
        features.whenAny(name, callback);
      });

      expect(callback.called).to.be.false;
      callback.reset();

      features.whenAny(testNamesActive, callback);

      expect(callback.calledOnce).to.be.true;
      callback.reset();

      features.whenAny(testNamesInactive, callback);

      expect(callback.called).to.be.false;
      callback.reset();

      features.whenAny(testNamesAll, callback);

      expect(callback.calledOnce).to.be.true;
    });

    context('when names is an empty array', function() {
      it('should never invoke function', function() {
        features.whenAny([], callback);

        expect(callback.called).to.be.false;
      });
    });

    context('when names is not specifed', function() {
      it('should never invoke function', function() {
        features.whenAny(callback);

        expect(callback.called).to.be.false;
      });
    });

    context('when names is null', function() {
      it('should never invoke function', function() {
        features.whenAny(null, callback);

        expect(callback.called).to.be.false;
      });
    });
  });

  function getVerifyErrorMessage(name) {
    return '"' + name + '" feature is not active';
  }
});
