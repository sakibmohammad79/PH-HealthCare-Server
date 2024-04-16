import { Patient, Prisma, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../../helper/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { patientSearchableFields } from "./patent.constant";
import { IPatientFilterRequest, IPatientUpdate } from "./patient.interface";
import { userInfo } from "os";

const getAllPatientFromDB = async (
  params: IPatientFilterRequest,
  paginateOptions: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginateOptions);

  const andCondition: Prisma.PatientWhereInput[] = [];
  if (params.searchTerm) {
    andCondition.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
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

  andCondition.push({
    isDeleted: false,
  });

  const whereCondition: Prisma.PatientWhereInput = { AND: andCondition };
  const result = await prisma.patient.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [paginateOptions.sortBy]: paginateOptions.sortOrder,
          }
        : { createdAt: "desc" },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });

  const total = await prisma.patient.count({
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

const getSinglePatientFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });
  return result;
};

const updatePatientIntoDB = async (
  id: string,
  payload: Partial<IPatientUpdate>
): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  //transaction
  await prisma.$transaction(async (tx) => {
    await tx.patient.update({
      where: {
        id,
      },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });
    if (patientHealthData) {
      await tx.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id,
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: patientInfo.id },
      });
    }

    if (medicalReport) {
      await tx.medicalReport.create({
        data: { patientId: patientInfo.id, ...medicalReport },
      });
    }
  });

  const patientUpdateResponse = await prisma.patient.findUnique({
    where: {
      id: patientInfo.id,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });

  return patientUpdateResponse;
};

const deletePatientFromDB = async (id: string): Promise<Patient | null> => {
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.$transaction(async (transactionClient) => {
    //delete patient health data
    await transactionClient.patientHealthData.delete({
      where: {
        patientId: patientInfo.id,
      },
    });

    //delete medical report
    await transactionClient.medicalReport.deleteMany({
      where: {
        patientId: patientInfo.id,
      },
    });
    //delete patient
    const deletedPatientData = await transactionClient.patient.delete({
      where: {
        id: patientInfo.id,
      },
    });
    const user = await transactionClient.user.delete({
      where: {
        email: deletedPatientData.email,
      },
    });
    return deletedPatientData;
  });
  return result;
};

const softDeletePatientIntoDB = async (id: string): Promise<Patient | null> => {
  await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });
  const result = await prisma.$transaction(async (transactionClient) => {
    const patentDeletedData = await transactionClient.patient.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
    await transactionClient.user.update({
      where: {
        email: patentDeletedData.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return patentDeletedData;
  });
  return result;
};

export const PatientService = {
  getAllPatientFromDB,
  getSinglePatientFromDB,
  updatePatientIntoDB,
  deletePatientFromDB,
  softDeletePatientIntoDB,
};
