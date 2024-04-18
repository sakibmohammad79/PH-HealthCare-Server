import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AppointmentService } from "./appointment.service";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";

const createAppointment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const result = await AppointmentService.createAppointmentIntoDB(
      user as IAuthUser,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Appointment booked successfully!",
      data: result,
    });
  }
);

export const AppointmentController = {
  createAppointment,
};
