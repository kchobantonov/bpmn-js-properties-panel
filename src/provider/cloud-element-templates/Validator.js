import {
  Validator as BaseValidator,
  filteredSchemaErrors,
  getSchemaVersion
} from '../element-templates/Validator';

import semver from 'semver';

import {
  validateCloud as validateAgainstSchema,
  getSchemaVersion as getTemplateSchemaVersion
} from '@bpmn-io/element-templates-validator';

const SUPPORTED_SCHEMA_VERSION = getTemplateSchemaVersion();

/**
 * A Camunda Cloud element template validator.
 */
export class Validator extends BaseValidator {
  constructor() {
    super();
  }

  /**
   * Validate given template and return error (if any).
   *
   * @param {TemplateDescriptor} template
   *
   * @return {Error} validation error, if any
   */
  _validateTemplate(template) {
    let err;

    const id = template.id,
          version = template.version || '_',
          schemaVersion = template.$schema && getSchemaVersion(template.$schema);

    // (1) compatibility
    if (schemaVersion && (semver.compare(SUPPORTED_SCHEMA_VERSION, schemaVersion) < 0)) {
      return this._logError(
        `unsupported element template schema version <${ schemaVersion }>. Your installation only supports up to version <${ SUPPORTED_SCHEMA_VERSION }>. Please update your installation`,
        template
      );
    }

    // (2) versioning
    if (this._templatesById[ id ] && this._templatesById[ id ][ version ]) {
      if (version === '_') {
        return this._logError(`template id <${ id }> already used`, template);
      } else {
        return this._logError(`template id <${ id }> and version <${ version }> already used`, template);
      }
    }

    // (3) JSON schema compliance
    const validationResult = validateAgainstSchema(template);

    const {
      errors,
      valid
    } = validationResult;

    if (!valid) {
      err = new Error('invalid template');

      filteredSchemaErrors(errors).forEach((error) => {
        this._logError(error.message, template);
      });
    }

    return err;
  }
}
