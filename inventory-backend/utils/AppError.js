class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true; // To distinguish from programming errors
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
      super(message, 404);
    }
  }
  
  export class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
      super(message, 400);
    }
  }
  
  export class UnprocessableEntityError extends AppError {
      constructor(message = 'Unprocessable Entity', errors = []) {
        super(message, 422);
        this.errors = errors; // For detailed validation errors
      }
    }
  
  export default AppError;