const { testStep } = require('../utils/supertest');
const httpStatus = require('http-status-codes');

const navigatesToNext = (step, nextStep, steps = [], session = {}) => {
  steps.push(nextStep);
  return testStep(step)
    .withSetup(req => {
      req.session.generate();
      Object.assign(req.session, { entryPoint: step.name }, session);
    })
    .withSteps(...steps)
    .post()
    .expect('Location', nextStep.path)
    .expect(httpStatus.MOVED_TEMPORARILY);
};

module.exports.navigatesToNext = navigatesToNext;
