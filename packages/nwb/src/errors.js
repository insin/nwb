/**
 * An error related to user input or configuration, or anything else the user is
 * responsible for and can fix.
 */
export class UserError {
  constructor(...messages) {
    this.message = messages.join('\n')
  }
}

export class KarmaExitCodeError {
  constructor(exitCode) {
    this.exitCode = exitCode
  }
}

export class ConfigValidationError {
  constructor(report) {
    this.report = report
  }
}
