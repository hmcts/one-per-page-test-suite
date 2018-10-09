const { testStep } = require('../utils/supertest');
const govukTemplate = require('@hmcts/look-and-feel/src/sources/govukTemplate');
const lookAndFeel = require('@hmcts/look-and-feel/src/sources/lookAndFeel');

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

const stepAsInstance = (step, session = {}) => {
  return new step({ journey: {}, session });
};

module.exports = { custom, stepAsInstance };
