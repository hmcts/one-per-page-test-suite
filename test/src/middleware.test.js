const modulePath = 'src/middleware';

const { nextMock, hasMiddleware } = require(modulePath);
const chai = require('chai');
const EntryPoint = require('@hmcts/one-per-page/src/steps/EntryPoint');
const sinon = require('sinon');
const { redirectTo } = require('@hmcts/one-per-page/src/flow');

const expect = chai.expect;

describe(modulePath, () => {
  describe('#hasMiddleware', () => {
    const middleware1 = sinon.stub();
    const middleware2 = sinon.stub();

    const Step = class extends EntryPoint {
      get middleware() {
        return [ middleware1 ];
      }
      next() {
        return redirectTo({ path: '' });
      }
    };

    it('passes if middleware is defined', () => {
      return hasMiddleware(Step, [ middleware1 ]);
    });

    it('fails if middleware not defined', () => {
      const shouldFail = () => {
        return hasMiddleware(Step, [ middleware2 ]);
      };
      return expect(shouldFail).to.throw('The following middleware was not found in step: expected [ \'stub\' ] to deeply equal []');
    });
  });

  describe('#nextmock', () => {
    it('returns a middleware mock', () => {
      const next = sinon.stub();
      nextMock({}, {}, next);
      expect(next.calledOnce).to.eql(true);
    });
  });
});
