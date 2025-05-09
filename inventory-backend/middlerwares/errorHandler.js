// This is a conceptual placement. You'd import AppError here.
// import AppError from './utils/AppError.js'; // Adjust path

const errorHandler = (err, req, res, next) => {
    console.error('ERROR 💥:', err);
  
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    // Handle Mongoose validation errors specifically
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      const message = `Invalid input data. ${errors.join('. ')}`;
      return res.status(400).json({ status: 'fail', message });
    }
  
    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
      const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
      const message = `Duplicate field value: ${value}. Please use another value.`;
      return res.status(400).json({ status: 'fail', message });
    }
  
    // Handle Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
      const message = `Invalid ${err.path}: ${err.value}.`;
      return res.status(400).json({ status: 'fail', message });
    }
    
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      const response = {
        status: err.status,
        message: err.message,
      };
      if (err.errors) { // For UnprocessableEntityError with details
          response.errors = err.errors;
      }
      return res.status(err.statusCode).json(response);
    }
  
    // Programming or other unknown error: don't leak error details
    // Log error
    console.error('PROGRAMMING OR UNKNOWN ERROR:', err);
    // Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  };
  
  export default errorHandler;
  // In your app.js:
  // app.use(errorHandler);