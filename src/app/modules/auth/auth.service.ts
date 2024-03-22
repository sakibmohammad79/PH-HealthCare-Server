import { error } from "console";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helper/jwtHelpers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  //compare password
  const isPasswordCorrect: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Password not correct!");
  }

  const jwtPayload = {
    userId: userData.id,
    email: userData.email,
    role: userData.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    process.env.ACCESS_TOKEN_SECRET as string,
    "15m"
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    process.env.REFRESH_TOKEN_SECRET as string,
    "2d"
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  //verify token
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      process.env.REFRESH_TOKEN_SECRET as string
    );
  } catch (error) {
    throw new Error("You are not authorized!");
  }

  //check if user delete
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const jwtPayload = {
    userId: userData.id,
    email: userData.email,
    role: userData.role,
  };
  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    process.env.ACCESS_TOKEN_SECRET as string,
    "15m"
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

export const AuthService = {
  loginUser,
  refreshToken,
};
