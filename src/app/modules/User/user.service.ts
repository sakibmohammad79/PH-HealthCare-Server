import { Admin, Doctor, Patient, Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../../helper/fileUploader";
import { IFile } from "../../interfaces/file";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { userInfo } from "os";
import { Request } from "express";
import { IAuthUser } from "../../interfaces/common";
import appError from "../../errors/appError";
import httpStatus from "http-status";

const createAdminIntoDB = async (req: any) => {
  const file = req.file as IFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
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

const createDoctorIntoDB = async (req: any) => {
  console.log(req);
  const file = req.file as IFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  //doctor
  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = prisma.$transaction(async (transactionClient) => {
    //create doctor
    await transactionClient.user.create({
      data: userData,
    });

    //create doctor
    const createDoctor = await transactionClient.doctor.create({
      data: req.body.doctor,
    });
    return createDoctor;
  });

  return result;
};

const createPatientIntoDB = async (req: any) => {
  const file = req.file as IFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.patient.profilePhoto = uploadToCloudinary?.secure_url;
  }

  //check similler patient is exists
  const isPatientExists = await prisma.patient.findUnique({
    where: {
      email: req.body.patient.email,
    },
  });
  const existsHttpStatus = 403;
  if (isPatientExists) {
    throw new appError(existsHttpStatus, "This patient already exists!");
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  //patient
  const userData = {
    email: req.body.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = prisma.$transaction(async (transactionClient) => {
    //create patient
    await transactionClient.user.create({
      data: userData,
    });

    //create patient
    const createPatient = await transactionClient.patient.create({
      data: req.body.patient,
    });
    return createPatient;
  });
  return result;
};

const getAllUserFromDB = async (
  params: any,
  paginateOptions: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginateOptions);

  const andCondition: Prisma.UserWhereInput[] = [];
  if (params.searchTerm) {
    andCondition.push({
      OR: userSearchableFields.map((field) => ({
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

  const whereCondition: Prisma.UserWhereInput = andCondition.length
    ? { AND: andCondition }
    : {};
  const result = await prisma.user.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [paginateOptions.sortBy as string]: paginateOptions.sortOrder,
          }
        : { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      needPasswordChange: true,
      createdAt: true,
      updatedAt: true,
      // admin: true,
      // patient: true,
      // doctor: true,
    },
  });

  const total = await prisma.user.count({
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

const updateUserStatusIntoDB = async (id: string, status: UserRole) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const updateUserStatus = await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: status,
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      needPasswordChange: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return updateUserStatus;
};

const getMyProfileIntoDB = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      needPasswordChange: true,
    },
  });

  let profileInfo;
  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }
  if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }
  if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }
  if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }

  return {
    ...userInfo,
    ...profileInfo,
  };
};

const updateMyProfileIntoDB = async (user: IAuthUser, req: Request) => {
  const userInfo = await prisma.user.findFirstOrThrow({
    where: {
      email: user?.email,
    },
  });
  const file = req.file as IFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.profilePhoto = uploadToCloudinary?.secure_url;
  }

  let profileInfo;
  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }
  if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }
  if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }
  if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }
  return profileInfo;
};

export const userService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUserFromDB,
  updateUserStatusIntoDB,
  getMyProfileIntoDB,
  updateMyProfileIntoDB,
};
