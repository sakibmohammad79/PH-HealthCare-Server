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
const getAllSpecialties = catchAsync(async (req, res, next) => {
  const result = await SpecialtiesService.getAllSpecialtiesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties data fetched successfully!",
    data: result,
  });
});
const removeSpecialties = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await SpecialtiesService.removeSpecialtiesIntoDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties delete successfully!",
    data: result,
  });
});

export const SpecialtiesController = {
  createSpecialties,
  getAllSpecialties,
  removeSpecialties,
};
