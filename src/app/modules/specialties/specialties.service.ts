import { Request } from "express";
import { fileUploader } from "../../../helper/fileUploader";
import { IFile } from "../../interfaces/file";
import prisma from "../../../shared/prisma";

const createSpecialtiesIntoDB = async (req: Request) => {
  const file = req.file as IFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });
  return result;
};

const getAllSpecialtiesFromDB = async () => {
  const result = await prisma.specialties.findMany();
  return result;
};

const removeSpecialtiesIntoDB = async (id: string) => {
  await prisma.specialties.findFirstOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialtiesService = {
  createSpecialtiesIntoDB,
  getAllSpecialtiesFromDB,
  removeSpecialtiesIntoDB,
};
