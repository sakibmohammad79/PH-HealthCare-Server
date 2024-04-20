import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { IAuthUser } from "../../interfaces/common";
import { ReviewService } from "./review.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { paginateOptions } from "../../globalConstant/constant";
import pick from "../../../shared/pick";

const createReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user as IAuthUser;

    const result = await ReviewService.createReviewIntoDB(user, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Added review successfully!",
      data: result,
    });
  }
);

const getAllReview = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, [
    "patientEmail",
    "doctorEmail",
    "doctorName",
    "patientName",
  ]);
  const options = pick(req.query, paginateOptions);
  const result = await ReviewService.getAllReviewFromDB(filter, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review data fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

export const ReviewController = {
  createReview,
  getAllReview,
};
