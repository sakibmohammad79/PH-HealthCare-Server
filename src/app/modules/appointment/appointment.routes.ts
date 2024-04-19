import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/my-appointmnet",
  auth(UserRole.DOCTOR, UserRole.PATIENT),
  AppointmentController.getMyAllAppointment
);

router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.createAppointment
);

export const AppointmentRoutes = router;
