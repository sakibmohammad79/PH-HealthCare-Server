import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { userFilterableFields } from "./user.constant";
import { paginateOptions } from "../admin/admin.constant";
import pick from "../../../shared/pick";

const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createAdminIntoDB(req);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Admin created successfully!",
      data: result,
    });
  }
);
const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createDoctorIntoDB(req);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Doctor created successfully!",
      data: result,
    });
  }
);
const createPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createPatientIntoDB(req);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Patient created successfully!",
      data: result,
    });
  }
);

const getAllUser = catchAsync(async (req, res, next) => {
  const query = pick(req.query, userFilterableFields);
  const options = pick(req.query, paginateOptions);
  const result = await userService.getAllUserFromDB(query, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User data fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await userService.updateUserStatusIntoDB(id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Update user status successfully!",
      data: result,
    });
  }
);

export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUser,
  updateUserStatus,
};
