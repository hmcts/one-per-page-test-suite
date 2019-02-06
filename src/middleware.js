const { expect } = require('../utils/chai');

const hasMiddleware = (step, middlewaresToTest) => {
  const stepInstance = new step({ journey: {} });

  const middlewareNotFound = middlewaresToTest.filter(middleware => {
    return !stepInstance.middleware.includes(middleware);
  });

  expect(middlewareNotFound.map(m => m.toString()), 'The following middleware was not found in step').to.eql([]); // eslint-disable-line
};

const nextMock = (req, res, next) => {
  next();
};

module.exports = { hasMiddleware, nextMock };
