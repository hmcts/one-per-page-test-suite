const { testStep } = require('@hmcts/one-per-page/test/util/supertest');
const govukTemplate = require('@hmcts/look-and-feel/src/sources/govukTemplate');
const lookAndFeel = require('@hmcts/look-and-feel/src/sources/lookAndFeel');
const { expect } = require('../utils/chai');

const templates = [
  govukTemplate.paths.templates,
  lookAndFeel.paths.templates,
  lookAndFeel.backwardsCompatibility.templates
];

const content = (step, ignoreContent = []) => {
  const stepInstance = new step({ journey: {} });
  const removeIgnoredContent = key => {
    return ignoreContent.includes(key);
  };

  return testStep(step)
    .withViews(...templates, stepInstance.dirname)
    .get()
    .text(pageContent => {
      const missingContent = [];
      const contentKeys = stepInstance.content.keys
        .filter(removeIgnoredContent);

      contentKeys.forEach(key => {
        const contentToTest = stepInstance.content[key].toString();
        if (pageContent.indexOf(contentToTest) === -1) {
          missingContent.push(key);
        }
      });

      expect(missingContent, 'The following content was not found in template').to.eql([]);
    });
};

module.exports = content;
