import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middleWars/authGurd";
import { fileUploader } from "../../../helper/fileUploader";
import { userValidations } from "./user.validation";

const router = Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidations.createAdminValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return userController.createUser(req, res, next);
  },
  userController.createUser
);

export const userRoutes = router;
