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

'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

describe('featuring', function() {
  var featuring, testFeatures1, testFeatures2, testFeaturesAll, testScope;

  beforeEach(function() {
    testFeatures1 = [ 'FOO', 'BAR' ];
    testFeatures2 = [ 'FU', 'BAZ' ];
    testFeaturesAll = testFeatures1.concat(testFeatures2);
    testScope = 'fizz';

    /* eslint-disable global-require */
    delete require.cache[require.resolve('../src/featuring')];
    featuring = require('../src/featuring');
    /* eslint-enable global-require */
  });

  it('should be a function', function() {
    expect(featuring).to.be.a('function');
  });

  context('when scope is not specified', function() {
    it('should return a Feature', function() {
      var feature = featuring(testFeatures1[0]);

      expect(feature).to.be.an('object');
    });
  });

  context('when scope is specified', function() {
    it('should return a Feature', function() {
      var feature = featuring(testFeatures1[0], testScope);

      expect(feature).to.be.an('object');
    });
  });

  describe('Feature', function() {
    describe('#active', function() {
      it('should be case sensitive', function() {
        featuring.init(testFeatures1, testScope);

        testFeatures1.forEach(function(name) {
          name = name.toLowerCase();

          expect(featuring(name, testScope).active()).to.be.false;
        });
        testFeatures1.forEach(function(name) {
          testScope = testScope.toUpperCase();

          expect(featuring(name, testScope).active()).to.be.false;
        });
      });

      context('when scope is not specified', function() {
        it('should return whether feature is active in global scope', function() {
          featuring.init(testFeatures1);

          testFeatures1.forEach(function(name) {
            expect(featuring(name).active()).to.be.true;
          });
          testFeatures2.forEach(function(name) {
            expect(featuring(name).active()).to.be.false;
          });
        });

        context('and global scope is not initialized', function() {
          it('should always return false', function() {
            testFeaturesAll.forEach(function(name) {
              expect(featuring(name).active()).to.be.false;
            });
          });
        });
      });

      context('when scope is specified', function() {
        it('should return whether feature is active in target scope', function() {
          featuring.init(testFeatures1, testScope);

          testFeatures1.forEach(function(name) {
            expect(featuring(name, testScope).active()).to.be.true;
          });
          testFeatures2.forEach(function(name) {
            expect(featuring(name, testScope).active()).to.be.false;
          });
        });

        context('and target scope is not initialized', function() {
          it('should always return false', function() {
            testFeaturesAll.forEach(function(name) {
              expect(featuring(name, testScope).active()).to.be.false;
            });
          });
        });
      });
    });

    describe('#using', function() {
      it('should return new instance with specified scope', function() {
        featuring.init(testFeatures1);
        featuring.init(testFeatures2, testScope);

        var feature1 = featuring(testFeatures1[0]);

        expect(feature1.active()).to.be.true;

        var feature2 = feature1.using(testScope);

        expect(feature1).not.to.equal(feature2);
        expect(feature2.active()).to.be.false;

        var feature3 = feature2.using(null);

        expect(feature2).not.to.equal(feature3);
        expect(feature3.active()).to.be.true;
      });

      it('should not modify original instance', function() {
        featuring.init(testFeatures1);
        featuring.init(testFeatures2, testScope);

        var feature1 = featuring(testFeatures1[0]);

        expect(feature1.active()).to.be.true;

        var feature2 = feature1.using(testScope);

        expect(feature1.active()).to.be.true;
        expect(feature2.active()).to.be.false;
      });
    });

    describe('#verify', function() {
      it('should be case sensitive', function() {
        featuring.init(testFeatures1, testScope);

        testFeatures1.forEach(function(name) {
          name = name.toLowerCase();

          expect(function() {
            featuring(name, testScope).verify();
          }).to.throw(Error, getVerifyErrorMessage(name, testScope));
        });
        testFeatures1.forEach(function(name) {
          testScope = testScope.toUpperCase();

          expect(function() {
            featuring(name, testScope).verify();
          }).to.throw(Error, getVerifyErrorMessage(name, testScope));
        });
      });

      it('should return reference to feature', function() {
        featuring.init(testFeatures1);

        var feature = featuring(testFeatures1[0]);

        expect(feature.verify()).to.equal(feature);
      });

      context('when scope is not specified', function() {
        it('should throw an error if feature is not active in global scope', function() {
          featuring.init(testFeatures1);

          testFeatures1.forEach(function(name) {
            expect(function() {
              featuring(name).verify();
            }).to.not.throw(Error, getVerifyErrorMessage(name));
          });
          testFeatures2.forEach(function(name) {
            expect(function() {
              featuring(name).verify();
            }).to.throw(Error, getVerifyErrorMessage(name));
          });
        });

        context('and global scope is not initialized', function() {
          it('should always throw an error', function() {
            testFeaturesAll.forEach(function(name) {
              expect(function() {
                featuring(name).verify();
              }).to.throw(Error, getVerifyErrorMessage(name));
            });
          });
        });
      });

      context('when scope is specified', function() {
        it('should throw an error if feature is not active in target scope', function() {
          featuring.init(testFeatures1, testScope);

          testFeatures1.forEach(function(name) {
            expect(function() {
              featuring(name, testScope).verify();
            }).to.not.throw(Error, getVerifyErrorMessage(name, testScope));
          });
          testFeatures2.forEach(function(name) {
            expect(function() {
              featuring(name, testScope).verify();
            }).to.throw(Error, getVerifyErrorMessage(name, testScope));
          });
        });

        context('and target scope is not initialized', function() {
          it('should always throw an error', function() {
            testFeaturesAll.forEach(function(name) {
              expect(function() {
                featuring(name, testScope).verify();
              }).to.throw(Error, getVerifyErrorMessage(name, testScope));
            });
          });
        });
      });
    });

    describe('#when', function() {
      var callback;

      beforeEach(function() {
        callback = sinon.stub();
      });

      it('should be case sensitive', function() {
        featuring.init(testFeatures1, testScope);

        testFeatures1.forEach(function(name) {
          name = name.toLowerCase();

          featuring(name, testScope).when(callback);
        });
        testFeatures1.forEach(function(name) {
          testScope = testScope.toUpperCase();

          featuring(name, testScope).when(callback);
        });

        expect(callback.called).to.be.false;
      });

      it('should return reference to feature', function() {
        featuring.init(testFeatures1);

        var feature = featuring(testFeatures1[0]);

        expect(feature.when(callback)).to.equal(feature);
      });

      context('when scope is not specified', function() {
        it('should invoke function when feature is active in global scope', function() {
          featuring.init(testFeatures1);

          testFeatures1.forEach(function(name) {
            featuring(name).when(callback);
          });

          expect(callback.callCount).to.equal(testFeatures1.length);
          callback.reset();

          testFeatures2.forEach(function(name) {
            featuring(name).when(callback);
          });

          expect(callback.called).to.be.false;
        });

        context('and global scope is not initialized', function() {
          it('should never invoke function', function() {
            testFeaturesAll.forEach(function(name) {
              featuring(name).when(callback);
            });

            expect(callback.called).to.be.false;
          });
        });
      });

      context('when scope is specified', function() {
        it('should invoke function when feature is active in target scope', function() {
          featuring.init(testFeatures1, testScope);

          testFeatures1.forEach(function(name) {
            featuring(name, testScope).when(callback);
          });

          expect(callback.callCount).to.equal(testFeatures1.length);
          callback.reset();

          testFeatures2.forEach(function(name) {
            featuring(name, testScope).when(callback);
          });

          expect(callback.called).to.be.false;
        });

        context('and target scope is not initialized', function() {
          it('should never invoke function', function() {
            testFeaturesAll.forEach(function(name) {
              featuring(name, testScope).when(callback);
            });

            expect(callback.called).to.be.false;
          });
        });
      });
    });
  });

  describe('.active', function() {
    it('should be case sensitive', function() {
      featuring.init(testFeatures1, testScope);

      testFeatures1.forEach(function(name) {
        name = name.toLowerCase();

        expect(featuring.active(name, testScope)).to.be.false;
      });
      testFeatures1.forEach(function(name) {
        testScope = testScope.toUpperCase();

        expect(featuring.active(name, testScope)).to.be.false;
      });

      var testFeatures = testFeatures1.map(function(name) {
        return name.toLowerCase();
      });

      expect(featuring.active(testFeatures, testScope)).to.be.false;

      testScope = testScope.toUpperCase();

      expect(featuring.active(testFeatures1, testScope)).to.be.false;
    });

    context('when names is an empty array', function() {
      it('should always return true', function() {
        expect(featuring.active([])).to.be.true;

        featuring.init(testFeatures1);

        expect(featuring.active([])).to.be.true;
      });
    });

    context('when scope is not specified', function() {
      it('should return whether all features are active in global scope', function() {
        featuring.init(testFeatures1);

        testFeatures1.forEach(function(name) {
          expect(featuring.active(name)).to.be.true;
        });
        testFeatures2.forEach(function(name) {
          expect(featuring.active(name)).to.be.false;
        });

        expect(featuring.active(testFeatures1)).to.be.true;
        expect(featuring.active(testFeatures2)).to.be.false;
        expect(featuring.active(testFeaturesAll)).to.be.false;
      });

      context('and global scope is not initialized', function() {
        it('should always return false', function() {
          testFeaturesAll.forEach(function(name) {
            expect(featuring.active(name)).to.be.false;
          });

          expect(featuring.active(testFeaturesAll)).to.be.false;
        });
      });
    });

    context('when scope is specified', function() {
      it('should return whether all features are active in target scope', function() {
        featuring.init(testFeatures1, testScope);

        testFeatures1.forEach(function(name) {
          expect(featuring.active(name, testScope)).to.be.true;
        });
        testFeatures2.forEach(function(name) {
          expect(featuring.active(name, testScope)).to.be.false;
        });

        expect(featuring.active(testFeatures1, testScope)).to.be.true;
        expect(featuring.active(testFeatures2, testScope)).to.be.false;
        expect(featuring.active(testFeaturesAll, testScope)).to.be.false;
      });

      context('and target scope is not initialized', function() {
        it('should always return false', function() {
          testFeaturesAll.forEach(function(name) {
            expect(featuring.active(name, testScope)).to.be.false;
          });

          expect(featuring.active(testFeaturesAll, testScope)).to.be.false;
        });
      });
    });
  });

  describe('.get', function() {
    context('when scope is not specified', function() {
      it('should return names of active features within global scope', function() {
        featuring.init(testFeatures1);

        expect(featuring.get()).to.eql(testFeatures1);
      });

      context('and global scope is not initialized', function() {
        it('should return an empty array', function() {
          expect(featuring.get()).to.eql([]);
        });
      });
    });

    context('when scope is specified', function() {
      it('should return names of active features within target scope', function() {
        featuring.init(testFeatures1, testScope);

        expect(featuring.get(testScope)).to.eql(testFeatures1);
      });

      context('and target scope is not initialized', function() {
        it('should return an empty array', function() {
          expect(featuring.get(testScope)).to.eql([]);
        });
      });
    });
  });

  describe('.init', function() {
    it('should return reference to featuring', function() {
      expect(featuring.init(testFeatures1)).to.equal(featuring);
    });

    context('when scope is not specified', function() {
      context('and global scope has already been initialized', function() {
        it('should throw an error', function() {
          featuring.init(testFeatures1);

          expect(function() {
            featuring.init(testFeatures1);
          }).to.throw(Error, getInitErrorMessage());
        });
      });

      context('and global scope has not been initialized', function() {
        it('should initialize global scope with specified features', function() {
          featuring.init(testFeatures1);

          testFeatures1.forEach(function(name) {
            expect(featuring(name).active()).to.be.true;
          });
          testFeatures2.forEach(function(name) {
            expect(featuring(name).active()).to.be.false;
          });
        });

        context('and names is an empty array', function() {
          it('should initialize global scope with no features', function() {
            featuring.init([]);

            testFeaturesAll.forEach(function(name) {
              expect(featuring(name).active()).to.be.false;
            });
          });
        });
      });
    });

    context('when scope is specified', function() {
      context('and target scope has already been initialized', function() {
        it('should throw an error', function() {
          featuring.init(testFeatures1, testScope);

          expect(function() {
            featuring.init(testFeatures1, testScope);
          }).to.throw(Error, getInitErrorMessage(testScope));
        });
      });

      context('and target scope has not been initialized', function() {
        it('should initialize target scope with specified features', function() {
          featuring.init(testFeatures1, testScope);

          testFeatures1.forEach(function(name) {
            expect(featuring(name, testScope).active()).to.be.true;
          });
          testFeatures2.forEach(function(name) {
            expect(featuring(name, testScope).active()).to.be.false;
          });
        });

        context('and names is an empty array', function() {
          it('should initialize target scope with no features', function() {
            featuring.init([], testScope);

            testFeaturesAll.forEach(function(name) {
              expect(featuring(name, testScope).active()).to.be.false;
            });
          });
        });
      });
    });
  });

  describe('.initialized', function() {
    context('when scope is not specified', function() {
      it('should return whether global scope has been initialized', function() {
        expect(featuring.initialized()).to.be.false;

        featuring.init(testFeatures1, testScope);

        expect(featuring.initialized()).to.be.false;

        featuring.init(testFeatures2);

        expect(featuring.initialized()).to.be.true;
      });
    });

    context('when scope is specified', function() {
      it('should return whether target scope has been initialized', function() {
        expect(featuring.initialized(testScope)).to.be.false;

        featuring.init(testFeatures1);

        expect(featuring.initialized(testScope)).to.be.false;

        featuring.init(testFeatures2, testScope);

        expect(featuring.initialized(testScope)).to.be.true;
      });
    });
  });

  describe.skip('.using', function() {
    // TODO: Complete
  });

  describe('.verify', function() {
    it('should be case sensitive', function() {
      featuring.init(testFeatures1, testScope);

      testFeatures1.forEach(function(name) {
        name = name.toLowerCase();

        expect(function() {
          featuring.verify(name, testScope);
        }).to.throw(Error, getVerifyErrorMessage(name, testScope));
      });
      testFeatures1.forEach(function(name) {
        testScope = testScope.toUpperCase();

        expect(function() {
          featuring.verify(name, testScope);
        }).to.throw(Error, getVerifyErrorMessage(name, testScope));
      });

      var testFeatures = testFeatures1.map(function(name) {
        return name.toLowerCase();
      });

      expect(function() {
        featuring.verify(testFeatures, testScope);
      }).to.throw(Error, getVerifyErrorMessage(testFeatures[0], testScope));

      testScope = testScope.toUpperCase();

      expect(function() {
        featuring.verify(testFeatures1, testScope);
      }).to.throw(Error, getVerifyErrorMessage(testFeatures1[0], testScope));
    });

    it('should return reference to featuring', function() {
      featuring.init(testFeatures1);

      expect(featuring.verify(testFeatures1[0])).to.equal(featuring);
    });

    context('when names is an empty array', function() {
      it('should never throw an error', function() {
        expect(function() {
          featuring.verify([]);
        }).to.not.throw(Error);

        featuring.init(testFeatures1);

        expect(function() {
          featuring.verify([]);
        }).to.not.throw(Error);
      });
    });

    context('when scope is not specified', function() {
      it('should throw an error any feature is not active in global scope', function() {
        featuring.init(testFeatures1);

        testFeatures1.forEach(function(name) {
          expect(function() {
            featuring.verify(name);
          }).to.not.throw(Error, getVerifyErrorMessage(name));
        });
        testFeatures2.forEach(function(name) {
          expect(function() {
            featuring.verify(name);
          }).to.throw(Error, getVerifyErrorMessage(name));
        });

        expect(function() {
          featuring.verify(testFeatures1);
        }).to.not.throw(Error);

        expect(function() {
          featuring.verify(testFeatures2);
        }).to.throw(Error, getVerifyErrorMessage(testFeatures2[0]));

        expect(function() {
          featuring.verify(testFeaturesAll);
        }).to.throw(Error, getVerifyErrorMessage(testFeatures2[0]));
      });

      context('and global scope is not initialized', function() {
        it('should always throw an error', function() {
          testFeaturesAll.forEach(function(name) {
            expect(function() {
              featuring.verify(name);
            }).to.throw(Error, getVerifyErrorMessage(name));
          });

          expect(function() {
            featuring.verify(testFeaturesAll);
          }).to.throw(Error, getVerifyErrorMessage(testFeaturesAll[0]));
        });
      });
    });

    context('when scope is specified', function() {
      it('should throw an error if any feature is not active in target scope', function() {
        featuring.init(testFeatures1, testScope);

        testFeatures1.forEach(function(name) {
          expect(function() {
            featuring.verify(name, testScope);
          }).to.not.throw(Error, getVerifyErrorMessage(name, testScope));
        });
        testFeatures2.forEach(function(name) {
          expect(function() {
            featuring.verify(name, testScope);
          }).to.throw(Error, getVerifyErrorMessage(name, testScope));
        });

        expect(function() {
          featuring.verify(testFeatures1, testScope);
        }).to.not.throw(Error);

        expect(function() {
          featuring.verify(testFeatures2, testScope);
        }).to.throw(Error, getVerifyErrorMessage(testFeatures2[0], testScope));

        expect(function() {
          featuring.verify(testFeaturesAll, testScope);
        }).to.throw(Error, getVerifyErrorMessage(testFeatures2[0], testScope));
      });

      context('and target scope is not initialized', function() {
        it('should always throw an error', function() {
          testFeaturesAll.forEach(function(name) {
            expect(function() {
              featuring.verify(name, testScope);
            }).to.throw(Error, getVerifyErrorMessage(name, testScope));
          });

          expect(function() {
            featuring.verify(testFeaturesAll, testScope);
          }).to.throw(Error, getVerifyErrorMessage(testFeaturesAll[0], testScope));
        });
      });
    });
  });

  describe('.when', function() {
    var callback;

    beforeEach(function() {
      callback = sinon.stub();
    });

    it('should be case sensitive', function() {
      featuring.init(testFeatures1, testScope);

      testFeatures1.forEach(function(name) {
        name = name.toLowerCase();

        featuring.when(name, testScope, callback);
      });
      testFeatures1.forEach(function(name) {
        testScope = testScope.toUpperCase();

        featuring.when(name, testScope, callback);
      });

      var testFeatures = testFeatures1.map(function(name) {
        return name.toLowerCase();
      });

      featuring.when(testFeatures, testScope);

      testScope = testScope.toUpperCase();

      featuring.when(testFeatures1, testScope);

      expect(callback.called).to.be.false;
    });

    it('should return reference to featuring', function() {
      featuring.init(testFeatures1);

      expect(featuring.when(testFeatures1, callback)).to.equal(featuring);
    });

    context('when names is an empty array', function() {
      it('should always invoke function', function() {
        featuring.when([], callback);

        expect(callback.calledOnce).to.be.true;
        callback.reset();

        featuring.init(testFeatures1);

        featuring.when([], callback);

        expect(callback.calledOnce).to.be.true;
      });
    });

    context('when scope is not specified', function() {
      it('should invoke function when all features are active in global scope', function() {
        featuring.init(testFeatures1);

        testFeatures1.forEach(function(name) {
          featuring.when(name, callback);
        });

        expect(callback.callCount).to.equal(testFeatures1.length);
        callback.reset();

        testFeatures2.forEach(function(name) {
          featuring.when(name, callback);
        });

        expect(callback.called).to.be.false;
        callback.reset();

        featuring.when(testFeatures1, callback);

        expect(callback.calledOnce).to.be.true;
        callback.reset();

        featuring.when(testFeatures2, callback);
        featuring.when(testFeaturesAll, callback);

        expect(callback.called).to.be.false;
      });

      context('and global scope is not initialized', function() {
        it('should never invoke function', function() {
          testFeaturesAll.forEach(function(name) {
            featuring.when(name, callback);
          });

          featuring.when(testFeaturesAll, callback);

          expect(callback.called).to.be.false;
        });
      });
    });

    context('when scope is specified', function() {
      it('should invoke function when all features are active in target scope', function() {
        featuring.init(testFeatures1, testScope);

        testFeatures1.forEach(function(name) {
          featuring.when(name, testScope, callback);
        });

        expect(callback.callCount).to.equal(testFeatures1.length);
        callback.reset();

        testFeatures2.forEach(function(name) {
          featuring.when(name, testScope, callback);
        });

        expect(callback.called).to.be.false;
        callback.reset();

        featuring.when(testFeatures1, testScope, callback);

        expect(callback.calledOnce).to.be.true;
        callback.reset();

        featuring.when(testFeatures2, testScope, callback);
        featuring.when(testFeaturesAll, testScope, callback);

        expect(callback.called).to.be.false;
      });

      context('and target scope is not initialized', function() {
        it('should never invoke function', function() {
          testFeaturesAll.forEach(function(name) {
            featuring.when(name, testScope, callback);
          });

          featuring.when(testFeaturesAll, testScope, callback);

          expect(callback.called).to.be.false;
        });
      });
    });
  });

  function getInitErrorMessage(scope) {
    if (scope == null) {
      return 'Global features have already been initialized';
    }

    return '"' + scope + '" scope features have already been initialized';
  }

  function getVerifyErrorMessage(name, scope) {
    if (scope == null) {
      return '"' + name + '" feature in global scope is not active';
    }

    return '"' + name + '" feature in "' + scope + '" scope is not active';
  }
});
