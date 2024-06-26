import { PaymentStatus, UserRole } from "@prisma/client";
import { IAuthUser } from "../../interfaces/common";
import prisma from "../../../shared/prisma";

const getDashboardMetaDataIntoDB = async (user: IAuthUser) => {
  let metaData;
  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      metaData = getSuperAdminMetaData();
      break;
    case UserRole.ADMIN:
      metaData = getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metaData = getDoctorMetaData(user);
      break;
    case UserRole.PATIENT:
      metaData = getPatientMetaData(user);
      break;
    default:
      throw new Error("Invalid user role!");
  }
  return metaData;
};

const getSuperAdminMetaData = async () => {
  const adminCount = await prisma.admin.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
  const appointmentBarChartData = await getAppointmentBarChartData();
  const appointmentPieChartData = await getAppointmentPieChartData();
  return {
    adminCount,
    doctorCount,
    patientCount,
    appointmentCount,
    paymentCount,
    totalRevenue,
    appointmentBarChartData,
    appointmentPieChartData,
  };
};
const getAdminMetaData = async () => {
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });

  const appointmentBarChartData = await getAppointmentBarChartData();
  const appointmentPieChartData = await getAppointmentPieChartData();

  return {
    doctorCount,
    patientCount,
    appointmentCount,
    paymentCount,
    totalRevenue,
    appointmentBarChartData,
    appointmentPieChartData,
  };
};
const getDoctorMetaData = async (user: IAuthUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: {
      id: true,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      appointment: {
        doctorId: doctorData.id,
      },
      status: PaymentStatus.PAID,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
    where: {
      doctorId: doctorData.id,
    },
  });

  const formatedAppointmentStatusDistribution =
    appointmentStatusDistribution.map((appointment) => ({
      count: Number(appointment._count.id),
      status: appointment.status,
    }));
  return {
    appointmentCount,
    reviewCount,
    patientCount: patientCount.length,
    totalRevenue,
    formatedAppointmentStatusDistribution,
  };
};
const getPatientMetaData = async (user: IAuthUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      id: patientData.id,
    },
  });

  const prescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patientData.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData.id,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
    where: {
      patientId: patientData.id,
    },
  });

  const formatedAppointmentStatusDistribution =
    appointmentStatusDistribution.map((appointment) => ({
      count: Number(appointment._count.id),
      status: appointment.status,
    }));

  return {
    appointmentCount,
    prescriptionCount,
    reviewCount,
    formatedAppointmentStatusDistribution,
  };
};

const getAppointmentBarChartData = async () => {
  const appointmentCountByMonth: { month: Date; count: bigint }[] =
    await prisma.$queryRaw`
  SELECT DATE_TRUNC('month', "createdAt") AS month,
  cast(COUNT(*) as INTEGER) AS count
  FROM "appointments"
  GROUP BY month
  ORDER BY month ASC
  `;

  // console.log(Number(appointmentCountByMonth[0].count));
  return appointmentCountByMonth;
};

const getAppointmentPieChartData = async () => {
  const appointmentCountByStatus = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  const formatedAppointmentStatusDistribution = appointmentCountByStatus.map(
    (appointment) => ({
      count: Number(appointment._count.id),
      status: appointment.status,
    })
  );

  return formatedAppointmentStatusDistribution;
};

export const MetaService = {
  getDashboardMetaDataIntoDB,
};
