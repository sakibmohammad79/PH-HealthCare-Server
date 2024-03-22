import { Router } from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleWars/validateRequest";
import { AdminValidationSchema } from "./admin.validation";

const router = Router();

router.get("/", adminController.getAllAdmin);

router.get("/:id", adminController.getSingleAdmin);

router.patch(
  "/:id",
  validateRequest(AdminValidationSchema.adminUpdateValidation),
  adminController.updateAdmin
);

router.delete("/:id", adminController.deleteAdmin);

router.delete("/soft/:id", adminController.softDeleteAdmin);

export const adminRoutes = router;
