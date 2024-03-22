import { NextFunction, Request, Response, RequestHandler } from "express";
import { adminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields, paginateOptions } from "./admin.constant";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";

const getAllAdmin: RequestHandler = catchAsync(async (req, res, next) => {
  const query = pick(req.query, adminFilterableFields);
  const options = pick(req.query, paginateOptions);
  const result = await adminService.getAllAdminFromDB(query, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAdmin: RequestHandler = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await adminService.getSingleAdminFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data fetched by id!",
    data: result,
  });
});

const updateAdmin: RequestHandler = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  const result = await adminService.updateAdminIntoDB(id, data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin update successfully!",
    data: result,
  });
});

const deleteAdmin: RequestHandler = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await adminService.deleteAdminFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin deleted successfully!",
    data: result,
  });
});

const softDeleteAdmin: RequestHandler = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await adminService.softDeleteAdminIntoDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin deleted successfully!",
    data: result,
  });
});

export const adminController = {
  getAllAdmin,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};
