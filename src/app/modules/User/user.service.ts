import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const createdUserIntoDB = async (payload: any) => {
  const userData = {
    email: payload.admin.email,
    password: payload.password,
    role: UserRole.ADMIN,
  };

  const result = prisma.$transaction(async (transactionClient) => {
    //create user
    await transactionClient.user.create({
      data: userData,
    });

    //create admin
    const createAdmin = await transactionClient.admin.create({
      data: payload.admin,
    });
    return createAdmin;
  });

  return result;
};

export const userService = {
  createdUserIntoDB,
};
