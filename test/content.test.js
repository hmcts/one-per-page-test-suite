const modulePath = 'src/content';

const content = require(modulePath);
const SampleStep = require('./steps/Sample.step');
const chai = require('chai');
const itParam = require('../utils/itParam');

const expect = chai.expect;

describe(modulePath, () => {
  describe('ignoreContent option', () => {
    it('ignores specified content', () => {
      return content(SampleStep, {}, { ignoreContent: ['missingValue'] });
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
    it('checks specified value to be present', () => {
      return content(SampleStep, {}, { specificValues: ['hello'] });
    });

    it('fails if specified value is not present', () => {
      return expect(content(SampleStep, {}, { specificValues: ['blah'] }))
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
      return content(SampleStep, {}, { specificContent: ['title'] });
    });

    it('fails if specified content is not present', () => {
      return expect(content(SampleStep, {}, { specificContent: ['blah'] }))
        .to
        .be
        .rejectedWith(Error);
    });
  });

  describe('specificValuesToNotExist option', () => {
    it('checks specified value is not present', () => {
      return content(SampleStep, {}, {
        ignoreContent: ['missingValue'],
        specificValuesToNotExist: ['blah']
      });
    });

    it('fails if specified content is present', () => {
      return expect(content(SampleStep, {}, {
        ignoreContent: ['missingValue'],
        specificValuesToNotExist: ['page title']
      }))
        .to
        .be
        .rejectedWith(Error);
    });
  });
});
