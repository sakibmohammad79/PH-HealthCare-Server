import { Router } from "express";
import { userController } from "./user.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middleWars/authGurd";
import { fileUploader } from "../../../helper/fileUploader";

const router = Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  userController.createUser
);

export const userRoutes = router;
