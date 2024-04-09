import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

const createAdminValidationSchema = z.object({
  password: z.string({ required_error: "password is required!" }),
  admin: z.object({
    name: z.string({ required_error: "Name is required!" }),
    email: z.string({ required_error: "Email is required!" }),
    contactNumber: z.string({
      required_error: "Contact Number is required!",
    }),
  }),
});

const createDoctorValidationSchema = z.object({
  password: z.string({ required_error: "Password is required!" }),
  doctor: z.object({
    name: z.string({ required_error: "Name is required!" }),
    email: z.string({ required_error: "Email is required!" }),
    contactNumber: z.string({
      required_error: "Contact Number is required!",
    }),
    address: z.string().optional(),
    registrationNumber: z.string({
      required_error: "Registration Number is required!",
    }),
    experience: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    appointmentFee: z.number({
      required_error: "Appointment Fee is required!",
    }),
    qualification: z.string({ required_error: "Qualification is required!" }),
    currentWorkingPlace: z.string({
      required_error: "Current working place is required!",
    }),
    designation: z.string({ required_error: "Designation is required!" }),
  }),
});
const createPatientValidationSchema = z.object({
  password: z.string({ required_error: "Password is required!" }),
  patient: z.object({
    name: z.string({ required_error: "Name is required!" }),
    email: z.string({ required_error: "Email is required!" }),
    contactNumber: z.string({
      required_error: "Contact Number is required!",
    }),
    address: z.string().optional(),
  }),
});

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.DELETED, UserStatus.BLOCKED]),
  }),
});

export const userValidations = {
  createAdminValidationSchema,
  createDoctorValidationSchema,
  createPatientValidationSchema,
  updateUserStatusValidationSchema,
};