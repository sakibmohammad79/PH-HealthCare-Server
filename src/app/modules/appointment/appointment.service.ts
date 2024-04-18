import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from "uuid";

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

  const doctorScheduleData = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });
  //generate video calling id
  const videoCallingId = uuidv4();

  const result = await prisma.appointment.create({
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
  return result;
};

export const AppointmentService = {
  createAppointmentIntoDB,
};
