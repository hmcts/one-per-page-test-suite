const { testStep } = require('../utils/supertest');
const govukTemplate = require('@hmcts/look-and-feel/src/sources/govukTemplate');
const lookAndFeel = require('@hmcts/look-and-feel/src/sources/lookAndFeel');

const templates = [
  govukTemplate.paths.templates,
  lookAndFeel.paths.templates,
  'views',
  'mocks',
  'steps'
];

const custom = step => {
  const stepInstance = new step({ journey: {} });

  return testStep(step)
    .withViews(...templates, stepInstance.dirname);
};

module.exports = custom;
