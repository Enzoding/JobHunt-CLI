export class HireCliError extends Error {
  constructor(code, message, help = '', exitCode = 1) {
    super(message);
    this.name = 'HireCliError';
    this.code = code;
    this.help = help;
    this.exitCode = exitCode;
  }
}

export class ApiError extends HireCliError {
  constructor(code, message, help = '') {
    super(code, message, help, 1);
    this.name = 'ApiError';
  }
}

export class EmptyResultError extends HireCliError {
  constructor(command, hint = '') {
    super('EMPTY_RESULT', `${command} returned no data`, hint, 66);
    this.name = 'EmptyResultError';
  }
}

export class ArgumentError extends HireCliError {
  constructor(message, help = '') {
    super('ARGUMENT_ERROR', message, help, 64);
    this.name = 'ArgumentError';
  }
}

export const CliError = ApiError;
