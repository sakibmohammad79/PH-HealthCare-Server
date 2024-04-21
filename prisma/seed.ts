import { UserRole } from "@prisma/client";
import prisma from "../src/shared/prisma";

const seedSuperAdmin = async () => {
  try {
    const isExistsSuperAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });
    if (isExistsSuperAdmin) {
      console.log("Super admin already exists!");
      return;
    }

    const createSuperAdmin = await prisma.user.create({
      data: {
        email: "super@admin.com",
        password: "superadmin",
        role: UserRole.SUPER_ADMIN,
        admin: {
          create: {
            name: "Super Admin",
            contactNumber: "018343534534",
          },
        },
      },
    });
    console.log("Super Admin created successfully", createSuperAdmin);
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
