const { testStep } = require('../utils/supertest');
const govukTemplate = require('@hmcts/look-and-feel/src/sources/govukTemplate');
const lookAndFeel = require('@hmcts/look-and-feel/src/sources/lookAndFeel');
const { expect } = require('../utils/chai');
const httpStatus = require('http-status-codes');

const templates = [
  govukTemplate.paths.templates,
  lookAndFeel.paths.templates,
  'views',
  'mocks',
  'steps',
  'node_modules/reform-pattern-library/app/views/macros'
];

const content = (step, session, options = {}) => {
  options.ignoreContent = options.ignoreContent || [];
  options.specificContent = options.specificContent || [];
  options.specificValues = options.specificValues || [];

  options.ignoreContent.push('fields', 'errors');

  const stepInstance = new step({ journey: {} });
  const removeIgnoredContent = keys => {
    return Object.keys(keys)
      .filter(key => {
        if (options.specificContent.length) {
          return options.specificContent.includes(key);
        }
        return !options.ignoreContent.includes(key);
      });
  };

  return testStep(step)
    .withSetup(req => {
      req.session.generate();
      return Object.assign(req.session, session);
    })
    .withViews(...templates, stepInstance.dirname)
    .get()
    .expect(httpStatus.OK)
    .text((pageContent, contentKeys) => {
      if (!options.specificValues.length) {
        const missingContent = [];
        removeIgnoredContent(contentKeys)
          .forEach(key => {
            if (pageContent.indexOf(contentKeys[key]) === -1) {
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
