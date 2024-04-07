import { Prisma, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { IAdminFilterRequest } from "../admin/admin.interface";
import { adminSearchableFields } from "../admin/admin.constant";
import prisma from "../../../shared/prisma";

const getAllDoctorFromDB = async (
  params: IAdminFilterRequest,
  paginateOptions: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginateOptions);

  const andCondition: Prisma.AdminWhereInput[] = [];
  if (params.searchTerm) {
    andCondition.push({
      OR: adminSearchableFields.map((field) => ({
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

  const whereCondition: Prisma.AdminWhereInput = { AND: andCondition };
  const result = await prisma.doctor.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [paginateOptions.sortBy]: paginateOptions.sortOrder,
          }
        : { createdAt: "desc" },
  });

  const total = await prisma.admin.count({
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
        (speciality) => speciality.isDeleted
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
        (speciality) => !speciality.isDeleted
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
