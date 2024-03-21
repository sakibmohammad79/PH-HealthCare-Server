import { NextFunction, Request, Response, response } from "express";
import { adminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields, paginateOptions } from "./admin.constant";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";

const getAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error: any) {
    next(error);
  }
};

const getSingleAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  console.log(id);
  try {
    const result = await adminService.getSingleAdminFromDB(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data fetched by id!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const result = await adminService.updateAdminIntoDB(id, data);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin update successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const result = await adminService.deleteAdminFromDB(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin deleted successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const softDeleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const result = await adminService.softDeleteAdminIntoDB(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin deleted successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const adminController = {
  getAllAdmin,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};
