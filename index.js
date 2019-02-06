const content = require('./src/content');
const { custom, stepAsInstance } = require('./src/custom');
const middleware = require('./src/middleware');
const { navigatesToNext } = require('./src/navigation');
const question = require('./src/question');
const chai = require('./utils/chai');
const itParam = require('./utils/itParam');
const requireNoCache = require('./utils/requireNoCache');
const journey = require('./src/journey');

module.exports.content = content;

module.exports.expect = chai.expect;

module.exports.sinon = chai.sinon;

module.exports.requireNoCache = requireNoCache;

module.exports.middleware = middleware;

// support legacy `interstitial.navigatesToNext`
module.exports.interstitial = { navigatesToNext };

// support legacy `redirect.navigatesToNext`
module.exports.redirect = { navigatesToNext };

module.exports.navigatesToNext = navigatesToNext;

module.exports.question = question;

module.exports.itParam = itParam;

module.exports.custom = custom;

module.exports.stepAsInstance = stepAsInstance;

module.exports.journey = journey;
