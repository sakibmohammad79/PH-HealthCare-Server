import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from "uuid";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helper/paginationHelper";
import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import appError from "../../errors/appError";
import httpStatus from "http-status";

const createAppointmentIntoDB = async (user: IAuthUser, payload: any) => {
  const patientData = await prisma.patient.findFirstOrThrow({
    where: {
      email: user?.email,
    },
  });

  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      id: payload.doctorId,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  //generate video calling id
  const videoCallingId: string = uuidv4();

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointmentData.id,
      },
    });
    //generate transaction id
    const date = new Date();
    const transactionId =
      "PH_HealthCare-" +
      date.getFullYear() +
      "-" +
      date.getMonth() +
      "-" +
      date.getDay() +
      "-" +
      date.getHours() +
      "-" +
      date.getMinutes();
    await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });
    return appointmentData;
  });

  return result;
};

const getAllAppointmentFromDB = async (
  user: IAuthUser,
  filter: any,
  options: IPaginationOptions
) => {
  const { ...filterData } = filter;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const andCondition: Prisma.AppointmentWhereInput[] = [];

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.AppointmentWhereInput = { AND: andCondition };
  const result = await prisma.appointment.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [options.sortBy as string]: options.sortOrder,
          }
        : { createdAt: "desc" },
    include:
      user?.role === UserRole.DOCTOR
        ? {
            patient: {
              include: {
                medicalReport: true,
                patientHealthData: true,
              },
            },
            schedule: true,
          }
        : {
            doctor: true,
            schedule: true,
          },
  });

  const total = await prisma.appointment.count({
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

const getMyAllAppointmentFromDB = async (
  user: IAuthUser,
  filter: any,
  options: IPaginationOptions
) => {
  const { ...filterData } = filter;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const andCondition: Prisma.AppointmentWhereInput[] = [];

  if (user?.role === UserRole.PATIENT) {
    andCondition.push({
      patient: {
        email: user?.email,
      },
    });
  } else if (user?.role === UserRole.DOCTOR) {
    andCondition.push({
      doctor: {
        email: user?.email,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.AppointmentWhereInput = { AND: andCondition };
  const result = await prisma.appointment.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [options.sortBy as string]: options.sortOrder,
          }
        : { createdAt: "desc" },
    include:
      user?.role === UserRole.DOCTOR
        ? {
            patient: {
              include: {
                medicalReport: true,
                patientHealthData: true,
              },
            },
            schedule: true,
          }
        : {
            doctor: true,
            schedule: true,
          },
  });

  const total = await prisma.appointment.count({
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

const changeAppointmentStatus = async (
  appointnmetId: string,
  status: AppointmentStatus,
  user: IAuthUser
) => {
  const appointmentData = await prisma.appointment.findFirstOrThrow({
    where: {
      id: appointnmetId,
    },
    include: {
      doctor: true,
    },
  });

  if (user?.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email)) {
      throw new appError(
        httpStatus.BAD_REQUEST,
        "This is not your appointment!"
      );
    }
  }

  const result = await prisma.appointment.update({
    where: {
      id: appointmentData.id,
    },
    data: {
      status,
    },
  });

  return result;
};

const cancelUnpaidAppointment = async () => {
  const thirtyMunitesAgo = new Date(Date.now() - 2 * 60 * 1000);

  const unpaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMunitesAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const unpaidAppointmentIds = unpaidAppointments.map(
    (Appointment) => Appointment.id
  );

  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: unpaidAppointmentIds,
        },
      },
    });

    await tx.appointment.deleteMany({
      where: {
        id: {
          in: unpaidAppointmentIds,
        },
      },
    });

    for (const unpaidAppointment of unpaidAppointments) {
      await tx.doctorSchedules.updateMany({
        where: {
          doctorId: unpaidAppointment.doctorId,
          scheduleId: unpaidAppointment.scheduleId,
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

export const AppointmentService = {
  createAppointmentIntoDB,
  getAllAppointmentFromDB,
  getMyAllAppointmentFromDB,
  changeAppointmentStatus,
  cancelUnpaidAppointment,
};
