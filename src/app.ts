import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";

import router from "./app/routes";
import httpStatus from "http-status";
import { globalErrorHandler } from "./app/middleWars/globalErorHandler";
const app: Application = express();

app.use(cors());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//application route
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Ph Health Care...",
  });
});

app.use(globalErrorHandler);

export default app;
