export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, FetchError.prototype);

    this.message = message;
  }
}
