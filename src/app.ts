import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import { globalErrorHandler } from "./app/middleWars/globalErorHandler";
import { apiNotFoundHandler } from "./app/middleWars/apiNotFoundHandler";
const app: Application = express();
import cookieParser from "cookie-parser";
import { AppointmentService } from "./app/modules/appointment/appointment.service";
import cron from "node-cron";

app.use(cors());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//application route
app.use("/api/v1", router);

cron.schedule("* * * * *", () => {
  try {
    AppointmentService.cancelUnpaidAppointment();
  } catch (error) {
    console.log(error);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Ph Health Care...",
  });
});

app.use(globalErrorHandler);

app.use(apiNotFoundHandler);

export default app;
