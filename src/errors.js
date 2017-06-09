// @flow
/**
 * An error related to user input or configuration, or anything else the user is
 * responsible for and can fix.
 */
export class UserError {
  message: string;
  constructor(...messages: string[]) {
    this.message = messages.join('\n')
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
