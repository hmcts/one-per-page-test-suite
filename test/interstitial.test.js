const modulePath = 'src/interstitial';

const { navigatesToNext } = require(modulePath);
const SampleStep = require('./steps/Sample.step');
const NextStep = require('./steps/Next.step');
const chai = require('chai');

const expect = chai.expect;

describe(modulePath, () => {
  it('Interstitial Navigtion', () => {
    return expect(navigatesToNext(SampleStep, NextStep, {}));
  });
});
