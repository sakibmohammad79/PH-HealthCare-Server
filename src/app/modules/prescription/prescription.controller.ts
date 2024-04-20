import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { IAuthUser } from "../../interfaces/common";
import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { paginateOptions } from "../../globalConstant/constant";

const createPrescription = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user as IAuthUser;
    const result = await PrescriptionService.createPrescriptionIntoDB(
      user,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Prescription created successfully!",
      data: result,
    });
  }
);
const getMyPrescription = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user as IAuthUser;
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await PrescriptionService.getMyPrescriptionIntoDB(
      user,
      options
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Prescription data fetched successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getAllPrescription = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, [
    "patientEmail",
    "doctorEmail",
    "doctorName",
    "patientName",
  ]);
  const options = pick(req.query, paginateOptions);
  const result = await PrescriptionService.getAllPrescriptionFromDB(
    filter,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription data fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

export const PrescriptionController = {
  createPrescription,
  getMyPrescription,
  getAllPrescription,
};
