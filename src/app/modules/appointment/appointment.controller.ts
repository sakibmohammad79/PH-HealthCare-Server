import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AppointmentService } from "./appointment.service";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";

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

const getAllAppointment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const filter = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const user = req.user;
    const result = await AppointmentService.getAllAppointmentFromDB(
      user as IAuthUser,
      filter,
      options
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointment data fetched successfully!",
      data: result,
    });
  }
);

const getMyAllAppointment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const filter = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const user = req.user;
    const result = await AppointmentService.getMyAllAppointmentFromDB(
      user as IAuthUser,
      filter,
      options
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My appointment data fetched successfully!",
      data: result,
    });
  }
);

const changeAppointmentStatus = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;
    const result = await AppointmentService.changeAppointmentStatus(
      id,
      status,
      user as IAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointment status changed successfully!",
      data: result,
    });
  }
);

export const AppointmentController = {
  createAppointment,
  getAllAppointment,
  getMyAllAppointment,
  changeAppointmentStatus,
};
