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

const content = (step, ignoreContent = []) => {
  const stepInstance = new step({ journey: {} });
  const removeIgnoredContent = key => {
    return !ignoreContent.includes(key);
  };

  return testStep(step)
    .withSetup(req => {
      return req.session.generate();
    })
    .withViews(...templates, stepInstance.dirname)
    .get()
    .expect(httpStatus.OK)
    .text((pageContent, contentKeys) => {
      const missingContent = [];
      contentKeys
        .filter(removeIgnoredContent)
        .forEach(key => {
          const contentToTest = stepInstance.content[key].toString();
          if (pageContent.indexOf(contentToTest) === -1) {
            missingContent.push(key);
          }
        });

      return expect(missingContent, 'The following content was not found in template').to.eql([]);
    });
};

module.exports = content;
