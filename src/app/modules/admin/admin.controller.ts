import { Request, Response } from "express";
import { adminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields, paginateOptions } from "./admin.constant";
import httpStatus from "http-status";
const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const query = pick(req.query, adminFilterableFields);
    const options = pick(req.query, paginateOptions);
    const result = await adminService.getAllAdminFromDB(query, options);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Admin data fetched!",
      meta: result.meta,
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.name || "Something Went Wrong!",
      error: error,
    });
  }
};

const getSingleAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  try {
    const result = await adminService.getSingleAdminFromDB(id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Admin data fetched by id!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.name || "Something Went Wrong!",
      error: error,
    });
  }
};

export const adminController = {
  getAllAdmin,
  getSingleAdmin,
};
