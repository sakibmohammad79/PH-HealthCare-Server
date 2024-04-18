import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { Request, Response } from "express";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";

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

const getAllMySchedule = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const filter = pick(req.query, ["startDate", "endDate", "isBooked"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const user = req.user;
    const result = await DoctorScheduleService.getAllMyScheduleFromDB(
      filter,
      options,
      user as IAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "My Schedule data fetched successfully!",
      data: result,
    });
  }
);
const deleteAllMySchedule = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const { id } = req.params;
    const result = await DoctorScheduleService.deleteMyScheduleFromDB(
      user as IAuthUser,
      id
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Schedule delete successfully!",
      data: result,
    });
  }
);

export const DoctorScheduleController = {
  createDoctorSchedule,
  getAllMySchedule,
  deleteAllMySchedule,
};
