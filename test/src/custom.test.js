const modulePath = 'src/custom';

const { custom, stepAsInstance } = require(modulePath);
const chai = require('chai');
const SampleStep = require('../steps/exit/Sample.step');
const { testStepDSL } = require('utils/supertest');

const expect = chai.expect;

describe(modulePath, () => {
  it('#custom returns test step DSL with instansiated with step', () => {
    const TestStepDSL = custom(SampleStep);
    expect(TestStepDSL instanceof testStepDSL).to.eql(true);
  });

  it('#stepAsInstance returns step as instance', () => {
    const SampleStepInstance = stepAsInstance(SampleStep, {});
    const SampleStepInstanceNoSess = stepAsInstance(SampleStep);
    expect(SampleStepInstance instanceof SampleStep).to.eql(true);
    expect(SampleStepInstanceNoSess instanceof SampleStep).to.eql(true);
  });
});
