const { testStep } = require('../utils/supertest');
const govukFrontend = require('@hmcts/look-and-feel/src/sources/govukFrontend');
const lookAndFeel = require('@hmcts/look-and-feel/src/sources/lookAndFeel');
const { expect } = require('../utils/chai');
const httpStatus = require('http-status-codes');
const { get } = require('lodash');
const walkMap = require('../utils/treeWalker');

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

const content = (step, session, options = {}) => {
  options.ignoreContent = options.ignoreContent || [];
  options.specificContent = options.specificContent || [];
  options.specificValues = options.specificValues || [];
  options.specificValuesToNotExist = options.specificValuesToNotExist || [];
  options.specificContentToNotExist = options.specificContentToNotExist || [];

  options.ignoreContent.push('fields', 'errors');

  const stepInstance = new step({ journey: {} });
  const removeIgnoredContent = keys => {
    const keysToReturn = [];
    walkMap(keys, path => {
      const rootKey = path.split('.')[0];
      if (!options.ignoreContent.includes(path) && !options.ignoreContent.includes(rootKey)) {
        keysToReturn.push(path);
      }
    });
    return keysToReturn;
  };

  return testStep(step)
    .withSetup(req => {
      req.session.generate();
      return Object.assign(req.session, { entryPoint: step.name }, session);
    })
    .withViews(...templates, stepInstance.dirname)
    .get()
    .expect(httpStatus.OK)
    .text((pageContent, contentKeys) => {

      if (options.specificValuesToNotExist.length) {
        const valueExists = [];
        options.specificValuesToNotExist
          .forEach(value => {
            if (pageContent.indexOf(value) !== -1) {
              valueExists.push(value);
            }
          });
        if (valueExists.length) {
          expect(valueExists, 'The following content was found in template when it wasnt supposed to be').to.eql([]);
        }
      }

      if (options.specificContentToNotExist.length) {
        const contentExists = [];
        options.specificContentToNotExist
          .forEach(key => {
            const contentValue = get(contentKeys, key);
            if (contentValue && pageContent.indexOf(contentValue) !== -1) {
              contentExists.push(key);
            }
          });

        return expect(contentExists, 'The following content should not be in the template').to.eql([]);
      }

      if (options.specificContent.length) {
        const missingContent = [];
        options.specificContent
          .forEach(key => {
            const contentValue = get(contentKeys, key);
            if (!contentValue || pageContent.indexOf(contentValue) === -1) {
              missingContent.push(key);
            }
          });

        return expect(missingContent, 'The following content was not found in template').to.eql([]);
      }

      if (!options.specificValues.length) {
        const missingContent = [];
        removeIgnoredContent(contentKeys)
          .forEach(key => {
            const contentValue = get(contentKeys, key);
            if (!contentValue || pageContent.indexOf(contentValue) === -1) {
              missingContent.push(key);
            }
          });

        return expect(missingContent, 'The following content was not found in template').to.eql([]);
      }

      const missingValues = [];
      options.specificValues
        .forEach(value => {
          if (pageContent.indexOf(value) === -1) {
            missingValues.push(value);
          }
        });

      return expect(missingValues, 'The following values were not found in template').to.eql([]);
    });
};

module.exports = content;
