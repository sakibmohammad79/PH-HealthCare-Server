import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  Prisma,
} from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import appError from "../../errors/appError";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helper/paginationHelper";

const createPrescriptionIntoDB = async (
  user: IAuthUser,
  payload: Partial<Prescription>
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (!(user?.email === appointmentData.doctor.email)) {
    throw new appError(httpStatus.BAD_REQUEST, "This is not your appointment!");
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null || undefined,
    },
    include: {
      patient: true,
    },
  });
  return result;
};

const getMyPrescriptionIntoDB = async (
  user: IAuthUser,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user?.email,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });

  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: user?.email,
      },
    },
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getAllPrescriptionFromDB = async (
  filter: any,
  paginateOptions: IPaginationOptions
) => {
  const { ...filterData } = filter;
  const { page, limit, skip } =
    paginationHelper.calculatePagination(paginateOptions);
  const andCondition: Prisma.PrescriptionWhereInput[] = [];

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

  const whereCondition: Prisma.PrescriptionWhereInput = { AND: andCondition };
  const result = await prisma.prescription.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      paginateOptions.sortBy && paginateOptions.sortOrder
        ? {
            [paginateOptions.sortBy as string]: paginateOptions.sortOrder,
          }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
    },
  });

  const total = await prisma.prescription.count({
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

export const PrescriptionService = {
  createPrescriptionIntoDB,
  getMyPrescriptionIntoDB,
  getAllPrescriptionFromDB,
};
