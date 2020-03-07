// @flow

/**
 * An error related to user input or configuration, or anything else the user is
 * responsible for and can fix.
 */
export class UserError extends Error {}

export class KarmaExitCodeError {
  exitCode: number;
  constructor(exitCode: number) {
    this.exitCode = exitCode
  }
}

export class ConfigValidationError {
  report: Object;
  constructor(report: Object) {
    this.report = report
  }
}
