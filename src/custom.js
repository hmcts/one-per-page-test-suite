const { testStep } = require('../utils/supertest');
const govukTemplate = require('@hmcts/look-and-feel/src/sources/govukTemplate');
const lookAndFeel = require('@hmcts/look-and-feel/src/sources/lookAndFeel');
const { expect } = require('../utils/chai');

const templates = [
  govukTemplate.paths.templates,
  lookAndFeel.paths.templates,
  'views',
  'mocks',
  'steps',
  'node_modules/reform-pattern-library/app/views/macros'
];

const custom = step => {
  const stepInstance = new step({ journey: {} });

  return testStep(step)
    .withViews(...templates, stepInstance.dirname);
};

const verifyResult = (step, methodName, expectedContent, session = {}) => {
  const stepInstance = new step({ journey: {}, session });
  const result = Reflect.get(stepInstance, methodName);
  expect(result).to.deep.equal(expectedContent);
};

module.exports = { custom, verifyResult };
