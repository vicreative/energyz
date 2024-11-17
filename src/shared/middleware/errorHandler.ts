import type { ErrorRequestHandler, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.sendStatus(StatusCodes.NOT_FOUND); // Handle unknown routes
};

const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  res.locals.err = err; // Optionally log the error to res.locals for debugging
  next(err); // Pass error to the next error handler
};

export default () => [unexpectedRequest, addErrorToRequestLog];
