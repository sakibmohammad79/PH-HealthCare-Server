import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import appError from "../../errors/appError";
import { IAuthUser } from "../../interfaces/common";

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

  const result = await prisma.review.create({
    data: {
      appointmentId: appointmentData.id,
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  return result;
};

export const ReviewService = {
  createReviewIntoDB,
};
