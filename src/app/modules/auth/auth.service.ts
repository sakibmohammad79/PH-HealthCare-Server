import { error } from "console";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helper/jwtHelpers";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
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

  const refressToken = jwtHelpers.generateToken(
    jwtPayload,
    process.env.REFRESS_TOKEN_SECRET as string,
    "2d"
  );

  return {
    accessToken,
    refressToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

export const AuthService = {
  loginUser,
};
