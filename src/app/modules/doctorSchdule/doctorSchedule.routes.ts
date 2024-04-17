import { Router } from "express";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";
import { DoctorScheduleController } from "./doctorSchedule.controller";

const router = Router();

router.post(
  "/",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.createDoctorSchedule
);

export const DoctorScheduleRoutes = router;
