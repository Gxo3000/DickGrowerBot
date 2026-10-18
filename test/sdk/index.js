// An offline stand-in for the platform's `sdk` module.

export { db } from './db.js';
export { api, BotApiError } from './api.js';
export { fetch } from './fetch.js';

export class InputFile {
  constructor(bytes, name, opts = {}) {
    this.bytes = bytes;
    this.name = name;
    this.type = opts.type;
  }
}

export class EndpointError extends Error {
  constructor(description, parameters = {}) {
    super(description);
    this.description = description;
    this.parameters = parameters;
  }
}
