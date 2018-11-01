const { ExitPoint } = require('@hmcts/one-per-page');

class SampleStep extends ExitPoint {
  static get path() {
    return '/';
  }

  get session() {
    return this.req.session;
  }
}

module.exports = SampleStep;
