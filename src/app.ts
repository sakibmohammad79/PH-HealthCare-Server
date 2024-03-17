import express, { Application, Request, Response } from "express";
import cors from "cors";
import { userRoutes } from "./app/modules/User/user.routes";
import { adminRoutes } from "./app/modules/admin/admin.routes";
const app: Application = express();

app.use(cors());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Ph Health Care...",
  });
});

export default app;
