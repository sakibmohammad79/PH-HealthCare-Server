import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../../helper/fileUploader";

const createdUserIntoDB = async (req: any) => {
  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
    console.log(req.body);
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  //admin
  const userData = {
    email: req.body.admin.email,
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
      data: req.body.admin,
    });
    return createAdmin;
  });

  return result;
};

export const userService = {
  createdUserIntoDB,
};
