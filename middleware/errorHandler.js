const { constants } = require("../constants");
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.json({
        title: "Validation Failed",
        status: statusCode,
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    case constants.NOT_FOUND:
      res.json({
        title: "Not Found",
        status: statusCode,
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    case constants.UNAUTHORIZED:
      res.json({
        title: "Unauthorized",
        status: statusCode,
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    case constants.FORBIDDEN:
      res.json({
        title: "Forbidden",
        status: statusCode,
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    case constants.SEVER_ERROR:
      res.json({
        title: "Server error",
        status: statusCode,
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    default:
      res.status(statusCode).json({
        title: "Error",
        status: statusCode,
        message: err.message || "An unexpected error occurred",
        stackTrace:
          process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
      break;
  }
};

module.exports = errorHandler;
