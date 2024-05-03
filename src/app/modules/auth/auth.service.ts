import { error } from "console";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helper/jwtHelpers";
import { Secret } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";
import config from "../../../config";
import eamilSender from "./emailSender";
import appError from "../../errors/appError";
import httpStatus from "http-status";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new appError(httpStatus.NOT_FOUND, "User does not exist!");
  }
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
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
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
      config.jwt.refresh_token_secret as Secret
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
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (
  user: {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  },
  payload: { oldPassword: string; newPassword: string },
  token: string
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  //compare password
  const isPasswordCorrect: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );
  if (!isPasswordCorrect) {
    throw new Error("Old password not correct!");
  }

  const verifyToken = jwtHelpers.verifyToken(
    token,
    config.jwt.access_token_secret as Secret
  );

  if (!verifyToken) {
    throw new appError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  //hashed password
  const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      email: userData.email,
      status: UserStatus.ACTIVE,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
  return {
    message: "Password change successfully!",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPasswordToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_password_token_secret as Secret,
    config.jwt.reset_password_token_expires_in as string
  );

  const resetPasswrodLink =
    config.reset_password_link +
    `?userId=${userData.id}&token=${resetPasswordToken}`;

  const html = `
      <div>
          <h4>Dear User,</h4>
          <p>your password reset link
            <a href=${resetPasswrodLink}>
              <button>Reset Password</button>
            </a>
          </p>
      </div>
    `;
  await eamilSender(userData.email, html);
};

const resetPassword = async (
  token: string | undefined,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const verifyToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_password_token_secret as Secret
  );

  if (!verifyToken) {
    throw new appError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  //hash password
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });
  return {
    message: "Reset password successfully!",
  };
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
