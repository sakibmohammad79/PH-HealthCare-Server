import { Prisma, User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import { IFilterRequest } from "../schedule/schedule.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helper/paginationHelper";
import { boolean } from "zod";
import appError from "../../errors/appError";
import httpStatus from "http-status";

const createDoctorScheduleIntoDB = async (
  user: any,
  payload: {
    scheduleIds: string[];
  }
) => {
  const doctorInfo = await prisma.doctor.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorInfo.id,
    scheduleId,
  }));
  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });

  return result;
};

const getAllMyScheduleFromDB = async (
  params: IFilterRequest,
  paginateOptions: IPaginationOptions,
  user: IAuthUser
) => {
  const { startDate, endDate, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginateOptions);

  const andCondition = [];

  if (startDate && endDate) {
    andCondition.push({
      AND: [
        {
          schedule: {
            startDateTime: {
              gte: startDate,
            },
          },
        },
        {
          schedule: {
            endDateTime: {
              lte: endDate,
            },
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false;
    }
    console.log(filterData);
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.DoctorSchedulesWhereInput = {
    AND: andCondition,
  };

  const result = await prisma.doctorSchedules.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [paginateOptions.sortBy as string]: paginateOptions.sortOrder,
          }
        : {},
  });

  const total = await prisma.doctorSchedules.count({
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

const deleteMyScheduleFromDB = async (user: IAuthUser, scheduleId: string) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const isBookedSchedule = await prisma.doctorSchedules.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId,
      },
      isBooked: true,
    },
  });

  if (isBookedSchedule) {
    throw new appError(
      httpStatus.BAD_REQUEST,
      "You can't delete the schedule because of the schedule already booked!"
    );
  }

  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId,
      },
    },
  });

  return result;
};

export const DoctorScheduleService = {
  createDoctorScheduleIntoDB,
  getAllMyScheduleFromDB,
  deleteMyScheduleFromDB,
};
