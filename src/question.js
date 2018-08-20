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
  'steps',
  'node_modules/reform-pattern-library/app/views/macros'
];

const testErrors = (step, session = {}) => {
  const request = testStep(step)
    .withSetup(req => {
      // on generate session once
      if (!req.session.active()) {
        req.session.generate();
        Object.assign(req.session, { entryPoint: step.name }, session);
      }
    })
    .withViews(...templates);

  const server = request.asServer();

  return server
    .post(step.path)
    .redirects(1)
    .expect(res => {
      const pageContent = res.text;
      const content = request._contentTransformed;

      const missingContent = [];
      Object.keys(content.errors)
        .forEach(key => {
          if (pageContent.indexOf(content.errors[key]) === -1) {
            missingContent.push(key);
          }
        });

      return expect(missingContent, 'The following errors were not found in template').to.eql([]);
    });
};

const redirectWithField = (step, fields, nextStep) => {
  let postRequest = testStep(step)
    .withSetup(req => {
      req.session.generate();
      Object.assign(req.session, { entryPoint: step.name });
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

module.exports.testErrors = testErrors;
