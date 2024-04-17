import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { Request } from "express";
import { IAuthUser } from "../../interfaces/common";

const createDoctorSchedule = catchAsync(
  async (req: Request & { user?: IAuthUser }, res) => {
    const user = req.user;
    const result = await DoctorScheduleService.createDoctorScheduleIntoDB(
      user,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Create doctor schedule successfully!",
      data: result,
    });
  }
);

export const DoctorScheduleController = {
  createDoctorSchedule,
};
