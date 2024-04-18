import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.createAppointment
);

export const AppointmentRoutes = router;
