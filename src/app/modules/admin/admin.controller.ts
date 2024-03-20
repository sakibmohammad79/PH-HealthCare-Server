import { Request, Response } from "express";
import { adminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields, paginateOptions } from "./admin.constant";

const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const query = pick(req.query, adminFilterableFields);
    const options = pick(req.query, paginateOptions);
    const result = await adminService.getAllAdminFromDB(query, options);
    res.status(200).json({
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

export const adminController = {
  getAllAdmin,
};
