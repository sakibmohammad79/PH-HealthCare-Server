import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";

const createdUserIntoDB = async (payload: any) => {
  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const userData = {
    email: payload.admin.email,
    password: hashedPassword,
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
