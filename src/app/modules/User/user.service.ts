import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";

const createdUserIntoDB = async (req: any) => {
  console.log("file", req.file);
  console.log("data", req.body.data);
  // const hashedPassword = await bcrypt.hash(payload.password, 12);
  // const userData = {
  //   email: req.admin.email,
  //   password: hashedPassword,
  //   role: UserRole.ADMIN,
  // };

  // const result = prisma.$transaction(async (transactionClient) => {
  //   //create user
  //   await transactionClient.user.create({
  //     data: userData,
  //   });

  //   //create admin
  //   const createAdmin = await transactionClient.admin.create({
  //     data: req.admin,
  //   });
  //   return createAdmin;
  // });

  // return result;
};

export const userService = {
  createdUserIntoDB,
};
