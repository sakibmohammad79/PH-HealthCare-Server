import { Router } from "express";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";
import { DoctorScheduleController } from "./doctorSchedule.controller";

const router = Router();

router.get(
  "/my-schedule",
  auth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  DoctorScheduleController.getAllMySchedule
);

router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PATIENT),
  DoctorScheduleController.getAllDoctorSchedule
);

router.post(
  "/",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorScheduleController.createDoctorSchedule
);

router.delete(
  "/:id",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.deleteAllMySchedule
);

export const DoctorScheduleRoutes = router;
