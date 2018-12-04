const { custom } = require('./custom');
const { expect } = require('./../utils/chai');
const url = require('url');
const httpStatus = require('http-status-codes');

const test = steps => {
  let failedTest = false;
  let lastPath = steps[0].step.path;

  beforeEach(function skiTest() {
    if (failedTest) {
      this.skip(); // eslint-disable-line no-invalid-this
    }
  });

  // Check to ensure each test passes - If a test fails then dont run the rest of the tests
  afterEach(function checkState() {
    if (this.currentTest.state === 'failed' && !failedTest) { // eslint-disable-line no-invalid-this
      failedTest = true;
    }
  });

  const server = custom(steps[0].step)
    .asServer(true);

  const testPage = (fromStep, toStep) => {
    it(`Renders ${fromStep.step.name} step`, () => {
      return server
        .get(fromStep.step.path)
        .then(response => {
          return expect(response.status).to.be
            .oneOf([ httpStatus.OK, httpStatus.MOVED_TEMPORARILY ]);
        })
        .then(() => {
          return server;
        });
    });

    if (toStep) {
      it(`Navigates from ${fromStep.step.name} to ${toStep.step.name}`, () => {
        expect(fromStep.step.path).to.eql(lastPath);
        let requestInstance = {};

        const stepType = Object.getPrototypeOf(fromStep.step).name;

        // if template is Redirect
        if (stepType === 'Redirect' || stepType === 'EntryPoint') {
          requestInstance = server.get(fromStep.step.path);
        } else {
          requestInstance = server.post(fromStep.step.path)
            .type('form')
            .send(fromStep.body);
        }

        return requestInstance
          .redirects(1)
          .then(response => {
            // get the url the page is currently on
            let newPath = response.headers.location;
            if (!newPath && response.redirects.length) {
              newPath = response.redirects[0];
            }
            newPath = url.parse(newPath).pathname;

            // is the new path the currect url
            expect(newPath).to.eql(toStep.step.path);

            // set the new path to old path to test the next step
            lastPath = newPath;
          });
      });
    }
  };

  steps.forEach((fromStep, index) => {
    const toStep = index + 1 < steps.length ? steps[index + 1] : null;
    testPage(fromStep, toStep);
  });
};

module.exports.test = test;
