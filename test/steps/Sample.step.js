const { Question } = require('@hmcts/one-per-page');

class SampleStep extends Question {
  static get path() {
    return '/';
  }

  get session() {
    return this.req.session;
  }
}

module.exports = SampleStep;
