import { string, z } from "zod";

const adminUpdateValidation = z.object({
  body: z.object({
    name: string().optional(),
    profilePhoto: string().optional(),
    contactNumber: string().optional(),
  }),
});

export const AdminValidationSchema = {
  adminUpdateValidation,
};
