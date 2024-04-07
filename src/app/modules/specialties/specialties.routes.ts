import { NextFunction, Request, Response, Router } from "express";
import { SpecialtiesController } from "./specialties.controller";
import { fileUploader } from "../../../helper/fileUploader";
import { SpecialtiesValidation } from "./specialties.validation";

const router = Router();

router.get("/", SpecialtiesController.getAllSpecialties);

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidation.createSpecialtiesValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return SpecialtiesController.createSpecialties(req, res, next);
  }
);

router.delete("/:id", SpecialtiesController.removeSpecialties);

export const SpecialtiesRoutes = router;
