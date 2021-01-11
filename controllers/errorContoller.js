const AppError = require('../utils/appError');

const handleCastDBError = err => {
  const message = `Invald ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDublicateDBError = err => {
  let username = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Sorry the Username ${username} is already taken. Please try with a different username`;
  return new AppError(message, 400);
};
const handleValidationDBError = err => {
  const errors = Object.values(err.erros).map(el => external.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
// Development Error message
const devEnvError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Production error Message
const prodEnvError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // log error for the developer
    console.error('Error', err);

    res.status(500).json({
      status: 'error',
      message: 'Opps!! Something went wrong..'
    });
  }
};

const handleJWTBError = () =>
  AppError('Invalid token, Please login with a valid token', 401);
const handleTokenExpiredError = () =>
  AppError('Your token has expired, please login again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devEnvError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastDBError(error);
    if (error.code === 11000) error = handleDublicateDBError(error);
    if (error.name === 'ValidationError')
      error = handleValidationDBError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTBError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();
    prodEnvError(error, res);
  }
};
