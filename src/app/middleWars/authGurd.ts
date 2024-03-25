import { Secret } from "jsonwebtoken";
import config from "../../config";
import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helper/jwtHelpers";
import appError from "../errors/appError";
import httpStatus from "http-status";

const auth = (...userRoles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new appError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }
      const verfiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_token_secret as Secret
      );

      //set user in req
      req.user = verfiedUser;
      console.log(verfiedUser);

      if (userRoles.length && !userRoles.includes(verfiedUser.role)) {
        throw new appError(httpStatus.FORBIDDEN, "You are forbidden!");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
export default auth;
