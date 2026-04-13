export class JobHuntCliError extends Error {
  constructor(code, message, help = '', exitCode = 1) {
    super(message);
    this.name = 'JobHuntCliError';
    this.code = code;
    this.help = help;
    this.exitCode = exitCode;
  }
}

export class ApiError extends JobHuntCliError {
  constructor(code, message, help = '') {
    super(code, message, help, 1);
    this.name = 'ApiError';
  }
}

export class EmptyResultError extends JobHuntCliError {
  constructor(command, hint = '') {
    super('EMPTY_RESULT', `${command} returned no data`, hint, 66);
    this.name = 'EmptyResultError';
  }
}

export class ArgumentError extends JobHuntCliError {
  constructor(message, help = '') {
    super('ARGUMENT_ERROR', message, help, 64);
    this.name = 'ArgumentError';
  }
}

export const CliError = ApiError;
