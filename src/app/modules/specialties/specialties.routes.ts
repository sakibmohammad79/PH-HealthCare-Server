import { NextFunction, Request, Response, Router } from "express";
import { SpecialtiesController } from "./specialties.controller";
import { fileUploader } from "../../../helper/fileUploader";

const router = Router();

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return SpecialtiesController.createSpecialties(req, res, next);
  }
);

export const SpecialtiesRoutes = router;
