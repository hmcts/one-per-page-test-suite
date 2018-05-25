const { testStep } = require('../utils/supertest');
const httpStatus = require('http-status-codes');
const { expect } = require('../utils/chai');
const govukTemplate = require('@hmcts/look-and-feel/src/sources/govukTemplate');
const lookAndFeel = require('@hmcts/look-and-feel/src/sources/lookAndFeel');

const templates = [
  govukTemplate.paths.templates,
  lookAndFeel.paths.templates,
  'views',
  'mocks',
  'steps'
];

const redirectWithField = (step, fields, nextStep) => {
  let postRequest = testStep(step)
    .withSetup(req => {
      return req.session.generate();
    })
    .withViews(...templates);

  Object.keys(fields).forEach(key => {
    postRequest = postRequest.withField(key, fields[key]);
  });

  return postRequest
    .withSteps(nextStep)
    .post()
    .expect('Location', nextStep.path)
    .expect(httpStatus.MOVED_TEMPORARILY);
};

const rendersValues = (step, sessionData = {}) => {
  return testStep(step)
    .withSession({ [step.name]: sessionData })
    .withViews(...templates)
    .get()
    .expect(httpStatus.OK)
    .html($ => {
      Object.keys(sessionData).forEach(key => {
        expect($(`#${key}-${sessionData[key]}`)).has.$val(sessionData[key]);
      });
    });
};

module.exports.redirectWithField = redirectWithField;

module.exports.rendersValues = rendersValues;
