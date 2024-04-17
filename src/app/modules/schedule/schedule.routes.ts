import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/", auth(UserRole.DOCTOR), ScheduleController.getAllSchedule);

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ScheduleController.createSchedule
);

export const ScheduleRoutes = router;
