import { Request, Response } from "express";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  const result = await userService.createdUserIntoDB(req.body);
  res.send(result);
};

export const userController = {
  createUser,
};
