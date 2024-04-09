import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
import { doctorFilterableFields } from "./doctor.constant";
import { paginateOptions } from "../../globalConstant/constant";

const getAllDoctor = catchAsync(async (req, res, next) => {
  const query = pick(req.query, doctorFilterableFields);
  const options = pick(req.query, paginateOptions);
  const result = await DoctorService.getAllDoctorFromDB(query, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor data fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleDoctor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await DoctorService.getSingleDoctorFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor data fetched by id!",
    data: result,
  });
});
const doctorDelete = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await DoctorService.doctorDeleteIntoDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor delete by id!",
    data: result,
  });
});
const doctorSoftDelete = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await DoctorService.doctorSoftDeleteIntoDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor soft delete by id!",
    data: result,
  });
});
const updateDoctor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await DoctorService.updateDoctorIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor update by id!",
    data: result,
  });
});

export const DoctorController = {
  getAllDoctor,
  getSingleDoctor,
  doctorDelete,
  doctorSoftDelete,
  updateDoctor,
};
