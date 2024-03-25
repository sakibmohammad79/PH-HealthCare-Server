import { error } from "console";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helper/jwtHelpers";
import { Secret } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";
import config from "../../../config";
import eamilSender from "./emailSender";

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

const changePassword = async (user, payload) => {
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

  console.log(resetPasswrodLink);
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
};
