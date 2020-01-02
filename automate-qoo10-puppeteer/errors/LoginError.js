class LoginError extends Error {
    constructor() {
        super('LoginError');
      }
}

module.exports = { LoginError };
