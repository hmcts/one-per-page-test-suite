const { testStep } = require('../utils/supertest');
const httpStatus = require('http-status-codes');

const navigatesToNext = (step, nextStep, session) => {
  const stepType = Object.getPrototypeOf(step).name;

  let test = testStep(step)
    .withSteps(nextStep);

  if (session) {
    test.withSession(session);
  } else if (stepType !== 'EntryPoint') {
    test.withSetup(req => {
      return req.session.generate();
    });
  }

  if (stepType === 'Redirect' || stepType === 'EntryPoint') {
    test = test.get();
  } else {
    test = test.post();
  }

  return test
    .expect('Location', nextStep.path)
    .expect(httpStatus.MOVED_TEMPORARILY);
};

module.exports.navigatesToNext = navigatesToNext;
