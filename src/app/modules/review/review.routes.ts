import { Router } from "express";
import auth from "../../middleWars/authGurd";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./review.controller";

const router = Router();

router.post(
  "/my-review",
  auth(UserRole.PATIENT),
  ReviewController.createReview
);

export const ReviewRoutes = router;
