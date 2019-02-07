const modulePath = 'src/question';

const question = require(modulePath);
const chai = require('chai');
const TestQuestion = require('test/steps/question/QuestionStep.step');
const { Question } = require('@hmcts/one-per-page/steps');
const { Interstitial } = require('@hmcts/one-per-page/steps');
const { form, text } = require('@hmcts/one-per-page/forms');
const { redirectTo, branch } = require('@hmcts/one-per-page/src/flow');
const { answer } = require('@hmcts/one-per-page/checkYourAnswers');

const expect = chai.expect;

describe(modulePath, () => {
  describe('#testErrors', () => {
    it('passes if errors show', () => {
      return question.testErrors(TestQuestion, {}, {});
    });

    it('passes if only specific error show', () => {
      const fields = { yesNo: 'yes' };
      const onlyErrors = ['yesNo2Error'];
      return question.testErrors(TestQuestion, {}, fields, { onlyErrors });
    });

    it('errors if errors other than only errors shown', () => {
      const shouldFail = () => {
        const fields = { yesNo2: 'yes' };
        const onlyErrors = ['yesNo2Error'];
        return question.testErrors(TestQuestion, {}, fields, { onlyErrors });
      };
      return expect(shouldFail()).to.be.rejectedWith('Errors were found in template when they shouldnt be there');
    });

    it('errors if no error found', () => {
      const shouldFail = () => {
        const fields = { yesNo: 'yes' };
        return question.testErrors(TestQuestion, {}, fields);
      };
      return expect(shouldFail()).to.be.rejectedWith('The following errors were not found in template');
    });
  });

  describe('#redirectWithField', () => {
    const Step1Next = class extends Interstitial {
      get template() {
        return 'interstitial_views/Interstitial';
      }
      next() {
        return redirectTo({ path: '/unkown-step' });
      }
    };

    const Step1 = class extends Question {
      get template() {
        return 'question_views/simpleQuestion';
      }
      next() {
        return branch(
          redirectTo(Step1Next)
            .if(this.fields.name.value === 'dom'),
          redirectTo({ path: '/error-path' })
        );
      }
      get form() {
        return form({ name: text });
      }
    };

    it('passes if navigates to next step', () => {
      return question.redirectWithField(Step1, { name: 'dom' }, Step1Next, {});
    });

    it('errors if navigates to wronge step', () => {
      const shouldFail = () => {
        return question.redirectWithField(Step1, { name: 'wronge' }, Step1Next, {});
      };
      return expect(shouldFail()).to.be.rejectedWith('expected "Location" of "/step1-next", got "/error-path"');
    });
  });

  describe('#rendersValues', () => {
    const Step1 = class extends Question {
      get template() {
        return 'question_views/simpleQuestion';
      }
      next() {
        return redirectTo({ path: '/' });
      }
      get form() {
        return form({ name: text });
      }
    };

    it('renderes values from session to the page', () => {
      return question.rendersValues(Step1, { name: 'dom' });
    });

    it('errors if values not shown on page', () => {
      const shouldFail = () => {
        return question.rendersValues(Step1, { test: 'this is a test field' });
      };
      return expect(shouldFail()).to.be.rejectedWith('The key \'test\' with value \'this is a test field\'');
    });
  });

  describe('#answers', () => {
    const Step1 = class extends Question {
      get template() {
        return 'question_views/simpleQuestion';
      }
      next() {
        return redirectTo({ path: '/' });
      }
      get form() {
        return form({ name: text });
      }
      answers() {
        return answer(this, {
          question: 'what is your name',
          answer: this.fields.name.value
        });
      }
    };

    it('passes if correct answers', () => {
      const expectedContent = [
        'what is your name',
        'Dom'
      ];
      const stepData = { name: 'Dom' };
      return question.answers(Step1, stepData, expectedContent);
    });

    it('passes with array of answers', () => {
      const StepMultipleAnswers = class extends Step1 {
        answers() {
          return [
            answer(this, {
              question: 'question 1',
              answer: 'answers 1'
            }),
            answer(this, {
              question: 'question 2',
              answer: 'answers 2'
            })
          ];
        }
      };

      const expectedContent = [
        'question 1',
        'question 2',
        'answers 1',
        'answers 2'
      ];
      const stepData = { name: 'Dom' };
      return question.answers(StepMultipleAnswers, stepData, expectedContent);
    });

    it('error if bad answers', () => {
      const shouldFail = () => {
        const expectedContent = [
          'what is your name',
          'bad answer'
        ];
        const stepData = { name: 'Dom' };
        return question.answers(Step1, stepData, expectedContent);
      };
      return expect(shouldFail()).to.be.rejectedWith('Following content was not found in the answers');
    });
  });
});
