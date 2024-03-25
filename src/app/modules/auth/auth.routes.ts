import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middleWars/authGurd";

const router = Router();

router.post("/login", AuthController.loginUser);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AuthController.changePassword
);

router.post(
  "/forgot-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AuthController.forgotPassword
);

export const AuthRoutes = router;
