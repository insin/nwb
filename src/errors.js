/**
 * An error related to user input or configuration, or anything else the user is
 * responsible for and can fix.
 */
export class UserError {
  constructor(...messages) {
    this.message = messages.join('\n')
  }
}

export class ConfigValidationErrors {
  constructor(errors, configPath) {
    this.errors = errors
    this.configPath = configPath
  }
}
