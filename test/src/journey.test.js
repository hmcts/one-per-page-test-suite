const modulePath = 'src/journey';

const journey = require(modulePath);
const EntryPoint = require('@hmcts/one-per-page/src/steps/EntryPoint');
const Interstitial = require('@hmcts/one-per-page/src/steps/Interstitial');
const Question = require('@hmcts/one-per-page/src/steps/Question');
const Page = require('@hmcts/one-per-page/src/steps/Page');
const { redirectTo } = require('@hmcts/one-per-page/src/flow');
const Joi = require('joi');
const { form, text } = require('@hmcts/one-per-page/forms');

const Step3 = class extends Page {
  get template() {
    return 'page_views/simplePage';
  }
};

const Step2 = class extends Question {
  get template() {
    return 'question_views/simpleQuestion';
  }
  next() {
    return redirectTo(Step3);
  }
  get form() {
    const answers = ['yes', 'no'];
    const validAnswers = Joi.string()
      .valid(answers)
      .required();

    return form({ field: text.joi('Error', validAnswers) });
  }
};

const Step1 = class extends Interstitial {
  get template() {
    return 'interstitial_views/interstitial';
  }
  next() {
    return redirectTo(Step2);
  }
};

const Entry = class extends EntryPoint {
  next() {
    return redirectTo(Step1);
  }
};

describe(modulePath, () => {
  journey.test([
    { step: Entry },
    { step: Step1 },
    { step: Step2, body: { field: 'yes' } },
    { step: Step3 }
  ]);
});
