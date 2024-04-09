import { NextFunction, Request, Response, RequestHandler } from "express";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { paginateOptions } from "../../globalConstant/constant";
import { patientFilterableFields } from "./patent.constant";
import { PatientService } from "./patient.service";
import pick from "../../../shared/pick";

const getAllPatient = catchAsync(async (req, res, next) => {
  const query = pick(req.query, patientFilterableFields);
  const options = pick(req.query, paginateOptions);
  const result = await PatientService.getAllPatientFromDB(query, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient data fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await PatientService.getSinglePatientFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient data fetched by id!",
    data: result,
  });
});

const updatePatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  const result = await PatientService.updatePatientIntoDB(id, data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient update successfully!",
    data: result,
  });
});

const deletePatient: RequestHandler = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await PatientService.deletePatientFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted successfully!",
    data: result,
  });
});

const softDeletePatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await PatientService.softDeletePatientIntoDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted successfully!",
    data: result,
  });
});

export const PatientController = {
  getAllPatient,
  getSinglePatient,
  updatePatient,
  deletePatient,
  softDeletePatient,
};
