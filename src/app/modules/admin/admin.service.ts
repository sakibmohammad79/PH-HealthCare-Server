import { Prisma, PrismaClient } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
const prisma = new PrismaClient();

const getAllAdminFromDB = async (params: any, paginateOptions: any) => {
  const { searchTerm, ...filterData } = params;
  const { page, limit } = paginateOptions;

  const andCondition: Prisma.AdminWhereInput[] = [];
  // [
  //   {
  //     name: {
  //       contains: params.searchTerm,
  //       mode: "insensitive",
  //     },
  //   },
  //   {
  //     email: {
  //       contains: params.searchTerm,
  //       mode: "insensitive",
  //     },
  //   },
  // ],

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
          equals: filterData[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.AdminWhereInput = { AND: andCondition };
  const result = await prisma.admin.findMany({
    where: whereCondition,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });
  return result;
};

export const adminService = {
  getAllAdminFromDB,
};
