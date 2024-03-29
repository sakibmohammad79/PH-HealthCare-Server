import { z } from "zod";

const createAdminValidationSchema = z.object({
  password: z.string({ required_error: "password is required!" }),
  admin: z.object({
    name: z.string({ required_error: "Name is required!" }),
    email: z.string({ required_error: "email is required!" }),
    contactNumber: z.string({
      required_error: "Contact Number is required!",
    }),
  }),
});

export const userValidations = {
  createAdminValidationSchema,
};
