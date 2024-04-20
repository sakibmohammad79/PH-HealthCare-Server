import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import appError from "../../errors/appError";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helper/paginationHelper";
import { Prisma } from "@prisma/client";

const createReviewIntoDB = async (user: IAuthUser, payload: any) => {
  const patientData = await prisma.patient.findFirstOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (!(patientData.id === appointmentData?.patientId)) {
    throw new appError(httpStatus.BAD_REQUEST, "This is not your appointment!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const createReviewData = await tx.review.create({
      data: {
        appointmentId: appointmentData.id,
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const averageRating = await tx.review.aggregate({
      _avg: {
        rating: true,
      },
    });
    await tx.doctor.update({
      where: {
        id: createReviewData.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
    return createReviewData;
  });

  return result;
};

const getAllReviewFromDB = async (
  filter: any,
  paginateOptions: IPaginationOptions
) => {
  const { ...filterData } = filter;
  const { page, limit, skip } =
    paginationHelper.calculatePagination(paginateOptions);

  const andCondition: Prisma.ReviewWhereInput[] = [];

  if (filterData.doctorEmail) {
    andCondition.push({
      doctor: {
        email: {
          equals: filterData.doctorEmail,
        },
      },
    });
  }

  if (filterData.patientEmail) {
    andCondition.push({
      patient: {
        email: {
          equals: filterData.patientEmail,
        },
      },
    });
  }

  if (filterData.doctorName) {
    andCondition.push({
      doctor: {
        name: {
          equals: filterData.doctorName,
        },
      },
    });
  }

  if (filterData.patientName) {
    andCondition.push({
      patient: {
        name: {
          equals: filterData.patientName,
        },
      },
    });
  }

  const whereCondition: Prisma.ReviewWhereInput = { AND: andCondition };
  const result = await prisma.review.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      paginateOptions.sortBy && paginateOptions.sortOrder
        ? {
            [paginateOptions.sortBy as string]: paginateOptions.sortOrder,
          }
        : { rating: "desc" },
    include: {
      patient: true,
      doctor: true,
    },
  });

  const total = await prisma.review.count({
    where: whereCondition,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const ReviewService = {
  createReviewIntoDB,
  getAllReviewFromDB,
};
