import { Request, Response } from "express";
import { adminService } from "./admin.service";

//obj => all query;  key: field name
const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> => {
  const finalQuery: Partial<T> = {};
  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalQuery[key] = obj[key];
    }
  }
  return finalQuery;
};

const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const filters = pick(req.query, [
      "name",
      "email",
      "contactNumber",
      "searchTerm",
    ]);
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
