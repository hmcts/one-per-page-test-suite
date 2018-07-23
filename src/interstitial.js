const { testStep } = require('../utils/supertest');
const httpStatus = require('http-status-codes');

const navigatesToNext = (step, nextStep, steps = []) => {
  steps.push(nextStep)
  return testStep(step)
    .withSetup(req => {
      return req.session.generate();
    })
    .withSteps(...steps)
    .post()
    .expect('Location', nextStep.path)
    .expect(httpStatus.MOVED_TEMPORARILY);
};

module.exports.navigatesToNext = navigatesToNext;
