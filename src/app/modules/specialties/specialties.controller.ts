import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { SpecialtiesService } from "./specialties.service";

const createSpecialties = catchAsync(async (req, res, next) => {
  const result = await SpecialtiesService.createSpecialtiesIntoDB(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Create specialties successfully!",
    data: result,
  });
});

export const SpecialtiesController = {
  createSpecialties,
};
