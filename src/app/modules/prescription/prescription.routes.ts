import { Router } from "express";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";
import { PrescriptionController } from "./prescription.controller";

const router = Router();

router.get(
  "/my-prescription",
  auth(UserRole.PATIENT),
  PrescriptionController.getMyPrescription
);
router.post(
  "/",
  auth(UserRole.DOCTOR),
  PrescriptionController.createPrescription
);

export const PrescriptionRoutes = router;
