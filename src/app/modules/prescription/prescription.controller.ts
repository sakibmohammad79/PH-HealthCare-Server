import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { IAuthUser } from "../../interfaces/common";
import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

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

export const PrescriptionController = {
  createPrescription,
};
