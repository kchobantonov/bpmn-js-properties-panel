import { Validator } from 'src/provider/cloud-element-templates/Validator';

import { getSchemaVersion as getTemplateSchemaVersion } from '@bpmn-io/element-templates-validator';

const ElementTemplateSchemaVersion = getTemplateSchemaVersion();


describe.only('provider/cloud-element-templates - Validator', function() {

  function errors(validator) {
    return validator.getErrors().map(function(e) {
      return e.message;
    });
  }

  function valid(validator) {
    return validator.getValidTemplates();
  }

  describe('schema version', function() {

    it('should accept when template and library have the same version', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-same-schema-version.json');

      templateDescriptor.map(function(template) {
        template.$schema = 'https://unpkg.com/@camunda/element-templates-json-schema@' +
          ElementTemplateSchemaVersion + '/resources/cloud.json';
      });

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept when template has lower version than library', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-low-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should reject when template has higher version than library', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-high-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(valid(templates)).to.be.empty;

      expect(errors(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept when template has no version', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept when template has latest version', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-latest-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept and reject when some templates have unsupported version', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-mixed-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.have.length(3);

      expect(valid(templates)).to.have.length(3);
    });


    it('should provide correct error details when rejecting', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-high-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.have.length(6);

      expect(errors(templates)[0]).to.eql('template(id: <foo>, name: <Foo>): unsupported element template schema version <99.99.99>. Your installation only supports up to version <' + ElementTemplateSchemaVersion + '>. Please update your installation');
    });

  });


  describe('content validation', function() {

    it('should accept simple example template', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });

  });
});
