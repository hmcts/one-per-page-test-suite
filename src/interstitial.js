const { testStep } = require('../utils/supertest');
const httpStatus = require('http-status-codes');

const navigatesToNext = (step, nextStep, session) => {
  const test = testStep(step)
    .withSteps(nextStep);

  if (session) {
    test.withSession(session);
  } else {
    test.withSetup(req => {
      return req.session.generate();
    });
  }

  return test.post()
    .expect('Location', nextStep.path)
    .expect(httpStatus.MOVED_TEMPORARILY);
};

module.exports.navigatesToNext = navigatesToNext;
