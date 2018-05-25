const { testStep } = require('../utils/supertest');
const httpStatus = require('http-status-codes');

const navigatesToNext = (step, nextStep) => {
  return testStep(step)
    .withSetup(req => {
      return req.session.generate();
    })
    .withSteps(nextStep)
    .post()
    .expect('Location', nextStep.path)
    .expect(httpStatus.MOVED_TEMPORARILY);
};

module.exports.navigatesToNext = navigatesToNext;
