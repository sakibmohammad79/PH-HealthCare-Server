import { Router } from "express";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";
import { DoctorScheduleController } from "./doctorSchedule.controller";

const router = Router();

router.get(
  "/my-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.getAllMySchedule
);

router.post(
  "/",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.createDoctorSchedule
);

router.delete(
  "/:id",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.deleteAllMySchedule
);

export const DoctorScheduleRoutes = router;
