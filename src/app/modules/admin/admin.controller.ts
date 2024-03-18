import { Request, Response } from "express";
import { adminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableField } from "./admin.constant";

const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const filters = pick(req.query, adminFilterableFields);
    const result = await adminService.getAllAdminFromDB(filters);
    res.status(200).json({
      success: true,
      message: "Admin data fetched!",
      data: result,
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
