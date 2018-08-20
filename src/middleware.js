const { expect } = require('../utils/chai');

const hasMiddleware = (step, middlewaresToTest = []) => {
  const stepInstance = new step({ journey: {} });
  const middlewares = stepInstance.middleware.map(middleware => {
    return middleware && middleware.toString();
  });
  const findMissingMiddleware = middlewareToTest => {
    return !middlewares.includes(middlewareToTest.toString());
  };

  const middlewareNotFound = middlewaresToTest.filter(findMissingMiddleware);

  expect(middlewareNotFound, 'The following middleware was not found in step').to.eql([]);
};

const nextMock = (req, res, next) => {
  next();
};

module.exports = { hasMiddleware, nextMock };
