const { testStep } = require('../utils/supertest');
const govukFrontend = require('@hmcts/look-and-feel/src/sources/govukFrontend');
const lookAndFeel = require('@hmcts/look-and-feel/src/sources/lookAndFeel');

const templates = [
  govukFrontend.paths.template,
  govukFrontend.paths.components,
  lookAndFeel.paths.templates,
  lookAndFeel.backwardsCompatibility.templates,
  'views',
  'mocks',
  'mocks/steps',
  'steps'
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
