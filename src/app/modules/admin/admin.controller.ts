import { Request, Response } from "express";
import { adminService } from "./admin.service";

const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getAllAdminFromDB(req.query);
    res.status(200).json({
      success: true,
      message: "All admin retrieved successfully!",
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
