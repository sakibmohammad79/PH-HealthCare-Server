import { Router } from "express";
import app from "../../../app";
import { userController } from "./user.controller";
import { UserRole } from "@prisma/client";
import { Secret } from "jsonwebtoken";
import auth from "../../middleWars/authGurd";

const router = Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  userController.createUser
);

export const userRoutes = router;
