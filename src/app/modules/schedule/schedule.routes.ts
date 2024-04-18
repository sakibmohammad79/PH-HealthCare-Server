import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/", auth(UserRole.DOCTOR), ScheduleController.getAllSchedule);

router.get("/:id", ScheduleController.getScheduleById);

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ScheduleController.createSchedule
);

router.delete("/:id", ScheduleController.deleteScheduleById);

export const ScheduleRoutes = router;
