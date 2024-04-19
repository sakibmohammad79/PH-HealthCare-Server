import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middleWars/validateRequest";
import { AppointmentValidation } from "./appointment.validation";

const router = Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AppointmentController.getAllAppointment
);

router.get(
  "/my-appointmnet",
  auth(UserRole.DOCTOR, UserRole.PATIENT),
  AppointmentController.getMyAllAppointment
);

router.post(
  "/",
  auth(UserRole.PATIENT),
  validateRequest(AppointmentValidation.createAppointmentValidationSchema),
  AppointmentController.createAppointment
);

export const AppointmentRoutes = router;
