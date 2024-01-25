class OwnerError extends Error {
   constructor(name, statusCode, message) {
      super(message);
      this.name = name;
      this.statusCode = statusCode;
   }
}

export default OwnerError;
