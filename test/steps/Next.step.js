const { ExitPoint } = require('@hmcts/one-per-page');

class NextStep extends ExitPoint {
  static get path() {
    return '/next';
  }
}

module.exports = NextStep;
