class LoginError extends Error {
    constructor() {
        super('LoginError');
        this.name = this.constructor.name;
      }
}

module.exports = { LoginError };
