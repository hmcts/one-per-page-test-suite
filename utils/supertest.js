const express = require('express');
const supertest = require('supertest');
const session = require('@hmcts/one-per-page/src/session');
const nunjucks = require('express-nunjucks');
const zepto = require('zepto-node');
const domino = require('domino');
const { expect } = require('./chai');
const { i18nMiddleware } = require('@hmcts/one-per-page/src/i18n/i18Next');
const { defined } = require('@hmcts/one-per-page/src/util/checks');
const { RequestBoundJourney } = require('@hmcts/one-per-page/src/flow');
const cookieParser = require('cookie-parser');
const httpStatus = require('http-status-codes');

const truthies = ['true', 'True', 'TRUE', '1', 'yes', 'Yes', 'YES', 'y', 'Y'];
const falsies = ['false', 'False', 'FALSE', '0', 'no', 'No', 'NO', 'n', 'N'];

function testApp(stepDSL) {
  const app = express();
  app.set('views', ['lib/', 'test/views', ...stepDSL.viewsDirs]);

  const globals = {
    isArray(value) {
      return Array.isArray(value);
    },
    parseBool(value) {
      if (truthies.includes(value)) {
        return true;
      }
      if (falsies.includes(value)) {
        return false;
      }
      return value;
    },
    isBoolean(value) {
      return typeof value === 'boolean';
    },
    safeId(...strings) {
      return strings
        .map(str => str.toString())
        .join('-')
        .toLowerCase()
        // replace foo[1] to foo-1
        .replace(/\[(\d{1,})\]/, '-$1')
        .replace(/[^A-Za-z0-9\s_-]/g, '')
        // replace 'foo bar' to 'foo-bar'
        .replace(/\s/g, '-');
    }
  };

  Object.assign(globals, stepDSL.globals);

  nunjucks(app, {
    autoescape: true,
    watch: true,
    noCache: true,
    globals
  });

  return app;
}

const _supertest = Symbol('supertest');
const _app = Symbol('app');
const _middleware = Symbol('middleware');

const configureApp = stepDSL => {
  if (stepDSL[_app]) return stepDSL[_app];

  const app = testApp(stepDSL);
  stepDSL[_app] = app;

  app.use((req, res, next) => {
    // setup req.journey (added by Journey)
    const steps = { [stepDSL.step.name]: stepDSL.step };
    stepDSL.steps.forEach(step => {
      steps[step.name] = step;
    });
    req.journey = new RequestBoundJourney(req, res, steps, {});
    next();
  });

  app.use(session({ baseUrl: '127.0.0.1', secret: 'keyboard cat' }));
  app.use(cookieParser());
  app.use(i18nMiddleware);

  app.get('/supertest-check-session', (req, res) => {
    const currentSession = Object.assign(
      {},
      req.session,
      { active: req.session.active() }
    );
    res.end(JSON.stringify(currentSession));
  });

  app.use((req, res, next) => {
    const instance = req.journey.instance(stepDSL.step);
    const sendOriginal = res.send;
    res.send = function send(body) {
      const contentTransformed = [];
      instance.content.keys.forEach(key => {
        contentTransformed[key] = instance.content[key].toString();
      });
      stepDSL._contentTransformed = contentTransformed;
      sendOriginal.call(this, body);
    };
    next();
  });

  stepDSL[_middleware].forEach(_ => app.use(_));
  stepDSL.step.bind(app);
  stepDSL.steps.forEach(step => {
    step.bind(app);
  });

  return stepDSL;
};

const supertestInstance = stepDSL => {
  if (stepDSL[_supertest]) return stepDSL[_supertest];

  configureApp(stepDSL);

  stepDSL[_supertest] = supertest(stepDSL[_app]);

  return stepDSL[_supertest];
};

const wrapWithResponseAssertions = (supertestObj, stepDSL) => {
  supertestObj.html = assertions => {
    return supertestObj.then(res => {
      const _window = domino.createWindow(res.text);
      const $ = zepto(_window);
      return assertions($);
    });
  };
  supertestObj.text = assertions => {
    return supertestObj.then(res => {
      return assertions(res.text, stepDSL._contentTransformed);
    });
  };
  supertestObj.session = assertions => {
    return supertestObj.then(res => {
      const cookies = res.headers['set-cookie'] || [];
      return supertest(supertestObj.app)
        .get('/supertest-check-session')
        .set('Cookie', cookies(res))
        .expect(httpStatus.OK);
    }).then(res => {
      const currentSession = JSON.parse(res.text);
      return Promise.all([assertions(currentSession)]);
    });
  };
  return supertestObj;
};

const shouldNotSetCookie = name => res => {
  if (typeof res.headers['set-cookie'] !== 'undefined') {
    return expect(res.headers['set-cookie']).to.not.include.match(name);
  }
  return expect(Object.keys(res.headers)).to.not.include('set-cookie');
};

const shouldSetCookie = name => {
  return res => Promise.all([
    expect(Object.keys(res.headers)).to.include('set-cookie'),
    expect(res.headers['set-cookie']).to.include.match(name)
  ]).then(() => res);
};

const constructorFrom = step => {
  if (defined(step.prototype)) {
    return step;
  }
  throw new Error(`Pass ${step.name} to supertest as a class not an instance`);
};

class TestStepDSL {
  constructor(step, body = {}, middleware = []) {
    this.step = constructorFrom(step);
    this.body = body;
    this[_middleware] = middleware;
    this.viewsDirs = [];
    this.steps = [];
    this.cookies = [];
    this.globals = {};
  }

  static create(step) {
    return new TestStepDSL(step);
  }

  withSession(sessionData) {
    return this.withMiddleware((req, res, next) => {
      req.session.generate();
      req.session = Object.assign(req.session, sessionData);
      next();
    });
  }

  withCookie(name, value) {
    this.cookies = [...this.cookies, `${name}=${value}`];
    return this;
  }

  withField(field, value) {
    Object.assign(this.body, { [field]: value });
    return this;
  }

  withGlobal(field, value) {
    Object.assign(this.globals, { [field]: value });
    return this;
  }

  withSetup(setup) {
    return this.withMiddleware((req, res, next) => {
      setup(req, res);
      next();
    });
  }

  withViews(...viewDirs) {
    this.viewsDirs = [...this.viewsDirs, ...viewDirs];
    return this;
  }

  withSteps(...steps) {
    const stepsConstructed = steps.map(step => constructorFrom(step));
    this.steps = [...stepsConstructed, ...this.steps];
    return this;
  }

  withMiddleware(newMiddleware) {
    this[_middleware] = [...this[_middleware], newMiddleware];
    return this;
  }

  execute(method, maybePath) {
    const path = defined(maybePath) ? maybePath : this.step.path;
    const testExecution = supertestInstance(this)[method](path);
    if (this.cookies.length) {
      testExecution.set('Cookie', this.cookies.join(';'));
    }
    return wrapWithResponseAssertions(testExecution, this);
  }

  asServer() {
    configureApp(this);
    return supertest.agent(this[_app]);
  }

  get(maybePath) {
    return this.execute('get', maybePath);
  }
  post(maybePath) {
    const postRequest = this.execute('post', maybePath);
    if (Object.keys(this.body).length !== 0) {
      return postRequest
        .type('form')
        .send(this.body);
    }
    return postRequest;
  }
  patch(maybePath) {
    return this.execute('patch', maybePath);
  }
  put(maybePath) {
    return this.execute('put', maybePath);
  }
  delete(maybePath) {
    return this.execute('delete', maybePath);
  }
}

module.exports = {
  supertest,
  testApp,
  testStep: TestStepDSL.create,
  shouldNotSetCookie,
  shouldSetCookie,
  wrapWithResponseAssertions
};
