import { Router } from "express";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./review.controller";

const router = Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ReviewController.getAllReview
);

router.post(
  "/my-review",
  auth(UserRole.PATIENT),
  ReviewController.createReview
);

export const ReviewRoutes = router;
