import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../../shared/prisma";
import { Prisma } from "@prisma/client";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err?.message || "Something Went Wrong!";
  let error = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    message = "validation error";
    error = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code == "P2002") {
      message = "Duplicate Key error!";
      error = err.meta;
    }
  }

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};
