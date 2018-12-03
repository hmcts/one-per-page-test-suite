const modulePath = 'src/content';

const content = require(modulePath);
const SampleStep = require('./steps/Sample.step');
const chai = require('chai');
const itParam = require('../utils/itParam');

const expect = chai.expect;

describe(modulePath, () => {
  describe('ignoreContent option', () => {
    it('ignores specified content', () => {
      return content(SampleStep, {}, { ignoreContent: ['missingValue', 'nested'] });
    });

    it('checks specified content to be present but ignores others', () => {
      return expect(content(SampleStep, {}, {
        specificContent: ['title'],
        ignoreContent: ['missingValue']
      }));
    });

    it('fails if content is missing (and not ignored)', () => {
      return expect(content(SampleStep, {}, {}))
        .to
        .be
        .rejectedWith(Error);
    });
  });


  describe('specificValues option', () => {
    it('checks if session values are present', () => {
      const session = { myString: 'session value' };
      return content(SampleStep, session, { specificValues: ['hello', 'session value'] });
    });

    it('fails if specified value is not present', () => {
      return expect(content(SampleStep, {}, { specificValues: ['blah', 'session value'] }))
        .to
        .be
        .rejectedWith(Error);
    });

    const params = ['hello', 'page title'];
    itParam('checks param value ${value} to be present', params, param => {
      return content(SampleStep, {}, { specificValues: [param] });
    });
  });

  describe('specificContent option', () => {
    it('checks specified value to be present', () => {
      const session = { myString: 'test' };
      return content(SampleStep, session, { specificContent: ['title', 'nested.depth.heading', 'dynamicContent'] });
    });

    it('fails if specified content is not present', () => {
      return expect(content(SampleStep, {}, { specificContent: ['blah'] }))
        .to
        .be
        .rejectedWith(Error);
    });
  });

  describe('specificContentToNotExist option', () => {
    it('checks specified content to not be present', () => {
      return content(SampleStep, {}, { specificContentToNotExist: ['contentThatDoesNotExsist'] });
    });

    it('fails if specified content is present', () => {
      return expect(content(SampleStep, {}, { specificContentToNotExist: ['title'] }))
        .to
        .be
        .rejectedWith(Error);
    });
  });

  describe('specificValuesToNotExist option', () => {
    it('checks specified value is not present', () => {
      return content(SampleStep, {}, {
        ignoreContent: ['missingValue', 'nested'],
        specificValuesToNotExist: ['blah']
      });
    });

    it('fails if specified content is present', () => {
      return expect(content(SampleStep, {}, {
        ignoreContent: ['missingValue', 'nested'],
        specificValuesToNotExist: ['page title']
      }))
        .to
        .be
        .rejectedWith(Error);
    });
  });
});
