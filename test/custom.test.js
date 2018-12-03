const modulePath = 'src/custom';

const { custom, stepAsInstance } = require(modulePath);
const SampleStep = require('./steps/Sample.step');
const chai = require('chai');

const expect = chai.expect;


describe(modulePath, () => {
  it('Custom step with templates', () => {
    const customInstance = custom(SampleStep);
    return expect(customInstance).to.have.ownPropertyDescriptor('viewsDirs', custom.templates);
  });

  it('get stepAsInstance', () => {
    const instance = stepAsInstance(SampleStep);
    return expect(instance).to.be.an.instanceof(SampleStep);
  });
});
