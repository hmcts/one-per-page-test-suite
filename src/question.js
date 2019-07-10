const { testStep } = require('../utils/supertest');
const httpStatus = require('http-status-codes');
const { expect } = require('../utils/chai');
const govukFrontend = require('@hmcts/look-and-feel/src/sources/govukFrontend');
const lookAndFeel = require('@hmcts/look-and-feel/src/sources/lookAndFeel');
const zepto = require('zepto-node');
const domino = require('domino');

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

const testErrors = (step, session = {}, fields = {}, options = {}) => {
  options.onlyErrors = options.onlyErrors || [];

  const request = testStep(step)
    .withSetup(req => {
      // on generate session once
      if (!req.session.active()) {
        req.session.generate();
        Object.assign(req.session, { entryPoint: step.name }, session);
      }
    })
    .withViews(...templates);

  const server = request.asServer(true);

  return server
    .post(step.path)
    .type('form')
    .send(fields)
    .redirects(1)
    .expect(res => {
      const _window = domino.createWindow(res.text);
      const $ = zepto(_window);
      const pageContent = $('body').text();

      const content = request._contentTransformed;

      const missingContent = [];
      const additionalContent = [];
      Object.keys(content.errors)
        .forEach(key => {
          const onlyErrors = options.onlyErrors.length;
          const contentIsInPage = pageContent
            .indexOf(content.errors[key]) !== -1;
          const keyInOnlyErrors = options.onlyErrors.includes(key);
          if (onlyErrors) {
            if (keyInOnlyErrors && !contentIsInPage) {
              missingContent.push(key);
            } else if (!keyInOnlyErrors && contentIsInPage) {
              additionalContent.push(key);
            }
          } else if (!contentIsInPage) {
            missingContent.push(key);
          }
        });

      if (additionalContent.length) {
        return expect(additionalContent, 'Errors were found in template when they shouldnt be there').to.eql([]);
      }
      return expect(missingContent, 'The following errors were not found in template').to.eql([]);
    });
};

const redirectWithField = (step, fields, nextStep, session = {}) => {
  let postRequest = testStep(step)
    .withSetup(req => {
      req.session.generate();
      Object.assign(req.session, { entryPoint: step.name }, session);
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

const rendersValues = (step, sessionData = {}, session = {}) => {
  Object.assign(session, { [step.name]: sessionData });
  return testStep(step)
    .withSession(session)
    .withViews(...templates)
    .get()
    .expect(httpStatus.OK)
    .html($ => {
      Object.keys(sessionData).forEach(key => {
        const val1 = $(`#${key.replace(/\./g, '\\.')}-${sessionData[key]}`).val();
        const val2 = $(`#${key.replace(/\./g, '\\.')}`).val();
        expect(val1 || val2, `The key '${key}' with value '${sessionData[key]}' was not found on the page`).to.eql(sessionData[key]);
      });
    });
};

const answers = (
  step,
  sessionData = {},
  expectedContent = [],
  session = {}
) => {
  Object.assign(session, { [step.name]: sessionData });
  return testStep(step)
    .withSession(session)
    .withViews(...templates)
    .get()
    .expect(httpStatus.OK)
    .text((pageContent, contentKeys, answersResult) => {
      let resultsContent = '';
      if (Array.isArray(answersResult)) {
        answersResult.forEach(result => {
          resultsContent += result.question.toString();
          resultsContent += result.answer.toString();
        });
      } else {
        resultsContent += answersResult.question.toString();
        resultsContent += answersResult.answer.toString();
      }

      const missingContent = [];

      expectedContent.forEach(content => {
        if (resultsContent.indexOf(content) === -1) {
          missingContent.push(content);
        }
      });
      return expect(missingContent, 'Following content was not found in the answers').to.eql([]);
    });
};

module.exports.redirectWithField = redirectWithField;

module.exports.rendersValues = rendersValues;

module.exports.testErrors = testErrors;

module.exports.answers = answers;
