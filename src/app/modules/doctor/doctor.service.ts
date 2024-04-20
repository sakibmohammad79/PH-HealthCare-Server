import { Prisma, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import prisma from "../../../shared/prisma";
import { doctorSearchableFields } from "./doctor.constant";
import { title } from "process";

const getAllDoctorFromDB = async (
  params: any,
  paginateOptions: IPaginationOptions
) => {
  const { searchTerm, specialties, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginateOptions);

  const andCondition: Prisma.DoctorWhereInput[] = [];
  if (params.searchTerm) {
    andCondition.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  //doctor => doctorSpecialties => specialties => title
  if (specialties && specialties.length > 0) {
    andCondition.push({
      doctorSpecialties: {
        some: {
          specialties: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
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

  andCondition.push({
    isDeleted: false,
  });

  const whereCondition: Prisma.DoctorWhereInput = { AND: andCondition };
  const result = await prisma.doctor.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      paginateOptions.sortBy && paginateOptions.sortOrder
        ? {
            [paginateOptions.sortBy as string]: paginateOptions.sortOrder,
          }
        : { averageRating: "desc" },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
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

const getSingleDoctorFromDB = async (id: string) => {
  const result = await prisma.doctor.findFirstOrThrow({
    where: {
      id,
    },
  });
  return result;
};

const doctorDeleteIntoDB = async (id: string) => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.$transaction(async (transactionClient) => {
    const doctorDeleteData = await transactionClient.doctor.delete({
      where: {
        id,
      },
    });
    await transactionClient.user.delete({
      where: {
        email: doctorDeleteData.email,
      },
    });
    return doctorDeleteData;
  });
  return result;
};

const doctorSoftDeleteIntoDB = async (id: string) => {
  await prisma.doctor.findFirstOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const doctorDeleteData = await transactionClient.doctor.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: doctorDeleteData.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return doctorDeleteData;
  });
  return result;
};

const updateDoctorIntoDB = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;

  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });
  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.doctor.update({
      where: {
        id: doctor.id,
      },
      data: doctorData,
    });

    if (specialties && specialties.length > 0) {
      //delete specialty
      const deleteSpecialtiesIds = specialties.filter(
        (speciality: { isDeleted: any }) => speciality.isDeleted
      );
      console.log(deleteSpecialtiesIds);
      for (const speciality of deleteSpecialtiesIds) {
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: doctor.id,
            specialtiesId: speciality.specialtiesId,
          },
        });
      }

      //create specialty
      const createSpecialtiesIds = specialties.filter(
        (speciality: { isDeleted: any }) => !speciality.isDeleted
      );
      for (const speciality of createSpecialtiesIds) {
        await transactionClient.doctorSpecialties.create({
          data: {
            doctorId: doctor.id,
            specialtiesId: speciality.specialtiesId,
          },
        });
      }
    }
  });
  const result = await prisma.doctor.findUnique({
    where: {
      id: doctor.id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });
  return result;
};

export const DoctorService = {
  getAllDoctorFromDB,
  getSingleDoctorFromDB,
  doctorDeleteIntoDB,
  doctorSoftDeleteIntoDB,
  updateDoctorIntoDB,
};
