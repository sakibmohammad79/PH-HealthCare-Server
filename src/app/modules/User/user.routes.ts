import { Router } from "express";
import app from "../../../app";
import { userController } from "./user.controller";

const router = Router();

router.post("/", userController.createUser);

export const userRoutes = router;
