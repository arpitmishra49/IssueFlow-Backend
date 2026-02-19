/**
 * Global Error Handling Middleware
 * Handles all errors passed using next(error)
 */

const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err.message);
  
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
  
    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
      statusCode = 400;
      message = "Duplicate field value entered";
    }
  
    // Mongoose CastError (Invalid ObjectId)
    if (err.name === "CastError") {
      statusCode = 400;
      message = "Invalid ID format";
    }
  
    // Mongoose Validation Error
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
    }
  
    // Development vs Production response
    if (process.env.NODE_ENV === "development") {
      return res.status(statusCode).json({
        status: "error",
        message,
        stack: err.stack,
      });
    }
  
    // Production response (hide stack trace)
    return res.status(statusCode).json({
      status: "error",
      message,
    });
  };
  
  export default errorHandler;
  