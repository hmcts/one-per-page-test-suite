const { expect } = require('../utils/chai');

const hasMiddleware = (step, middlewaresToTest) => {
  const stepInstance = new step({ journey: {} });

  const stepMiddlewares = stepInstance.middleware.map(m => {
    return m && m.toString();
  });

  const middlewareNotFound = middlewaresToTest.filter(middleware => {
    return !stepMiddlewares.includes(middleware.toString());
  });

  expect(middlewareNotFound.map(m => m.toString()), 'The following middleware was not found in step').to.eql([]); // eslint-disable-line
};

const nextMock = (req, res, next) => {
  next();
};

module.exports = { hasMiddleware, nextMock };
