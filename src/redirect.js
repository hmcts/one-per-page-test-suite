const { testStep } = require('../utils/supertest');
const httpStatus = require('http-status-codes');

const navigatesToNext = (step, nextStep) => {
  return testStep(step)
    .withSteps(nextStep)
    .get()
    .expect('Location', nextStep.path)
    .expect(httpStatus.MOVED_TEMPORARILY);
};

module.exports.navigatesToNext = navigatesToNext;
