import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ScheduleController.getAllSchedule
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  ScheduleController.getScheduleById
);

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ScheduleController.createSchedule
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ScheduleController.deleteScheduleById
);

export const ScheduleRoutes = router;
