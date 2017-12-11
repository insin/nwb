// @flow
/**
 * An error related to user input or configuration, or anything else the user is
 * responsible for and can fix.
 */
export class UserError extends Error {
  constructor(message: string) {
    super(message)
    // Make instanceof UserError work in ES5
    // $FlowFixMe
    this.constructor = UserError
    // $FlowFixMe
    this.__proto__ = UserError.prototype // eslint-disable-line no-proto
  }
}

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
