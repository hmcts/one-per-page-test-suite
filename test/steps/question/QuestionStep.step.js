const { Question } = require('@hmcts/one-per-page/steps');
const { form, text } = require('@hmcts/one-per-page/forms');
const { redirectTo } = require('@hmcts/one-per-page/flow');
const Joi = require('joi');

class QuestionStep extends Question {
  get template() {
    return 'question/QuestionStep.html';
  }

  get form() {
    const yesNo = text
      .joi(
        this.content.errors.yesNoError,
        Joi.string()
          .valid(['yes', 'no'])
          .required()
      );

    const yesNo2 = text
      .joi(
        this.content.errors.yesNo2Error,
        Joi.string()
          .valid(['yes', 'no'])
          .required()
      );

    return form({ yesNo, yesNo2 });
  }

  next() {
    return redirectTo({ path: '/test' });
  }
}

module.exports = QuestionStep;
