class CustomError extends Error {
  constructor(name, statusCode, message) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export default CustomError;
