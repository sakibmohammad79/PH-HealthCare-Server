import jwt, { JwtPayload } from "jsonwebtoken";
const generateToken = (jwtPayload: JwtPayload, secret: string, exp: string) => {
  const accessToken = jwt.sign(jwtPayload, secret as string, {
    algorithm: "HS256",
    expiresIn: exp,
  });
  return accessToken;
};

export const jwtHelpers = {
  generateToken,
};
