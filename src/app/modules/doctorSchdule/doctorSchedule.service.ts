import { User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";

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

export const DoctorScheduleService = {
  createDoctorScheduleIntoDB,
};
