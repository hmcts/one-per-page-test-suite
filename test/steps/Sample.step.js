const { ExitPoint } = require('@hmcts/one-per-page');

class SampleStep extends ExitPoint {
  static get path() {
    return '/';
  }
}

module.exports = SampleStep;
