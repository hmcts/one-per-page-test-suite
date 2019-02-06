const modulePath = 'src/navigation';

const { navigatesToNext } = require(modulePath);
const chai = require('chai');
const Interstitial = require('@hmcts/one-per-page/src/steps/Interstitial');
const { redirectTo } = require('@hmcts/one-per-page/src/flow');
const Redirect = require('@hmcts/one-per-page/src/steps/Redirect');
const EntryPoint = require('@hmcts/one-per-page/src/steps/EntryPoint');

const expect = chai.expect;

describe(modulePath, () => {
  describe('#navigatesToNext', () => {
    const Step1 = class extends Interstitial {
      get template() {
        return 'interstitial_views/Interstitial';
      }
      next() {
        return redirectTo({ path: '/step1-next' });
      }
    };

    const Step1Next = class extends Interstitial {
      get template() {
        return 'interstitial_views/Interstitial';
      }
      next() {
        return redirectTo({ path: '/unkown-step' });
      }
    };

    it('passes if navigates to next step', () => {
      return navigatesToNext(Step1, Step1Next, {});
    });

    it('passes if navigating from redirect step', () => {
      const RedirectStep = class extends Redirect {
        next() {
          return redirectTo(Step1);
        }
      };
      return navigatesToNext(RedirectStep, Step1);
    });

    it('passes if navigating from redirect step', () => {
      const EntryPointStep = class extends EntryPoint {
        next() {
          return redirectTo(Step1);
        }
      };
      return navigatesToNext(EntryPointStep, Step1);
    });

    it('fails if does not navigate to next step', () => {
      const shouldFail = () => {
        return navigatesToNext(Step1Next, Step1);
      };
      return expect(shouldFail()).to.be.rejectedWith('expected "Location" of "/step1", got "/unkown-step"');
    });
  });
});
