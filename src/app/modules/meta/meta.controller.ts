import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { IAuthUser } from "../../interfaces/common";
import { MetaService } from "./meta.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const getDashboardMetaData = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user as IAuthUser;
    const result = await MetaService.getDashboardMetaDataIntoDB(user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Fetched meta data successfully!",
      data: result,
    });
  }
);

export const MetaController = {
  getDashboardMetaData,
};
