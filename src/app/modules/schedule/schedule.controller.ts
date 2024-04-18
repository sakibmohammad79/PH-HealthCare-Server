import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { ScheduleService } from "./schedule.service";
import pick from "../../../shared/pick";
import { Request, Response } from "express";
import { IAuthUser } from "../../interfaces/common";

const createSchedule = catchAsync(async (req, res) => {
  const result = await ScheduleService.createScheduleIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Create schedule successfully!",
    data: result,
  });
});

const getAllSchedule = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const filter = pick(req.query, ["startDate", "endDate"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const user = req.user;
    const result = await ScheduleService.getAllScheduleFromDB(
      filter,
      options,
      user as IAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Schedule data fatched successfully!",
      data: result,
    });
  }
);

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ScheduleService.getScheduleByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Fetched schedule data by Id!",
    data: result,
  });
});
const deleteScheduleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ScheduleService.deleteScheduleById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Delete schedule by Id!",
    data: result,
  });
});

export const ScheduleController = {
  createSchedule,
  getAllSchedule,
  getScheduleById,
  deleteScheduleById,
};
