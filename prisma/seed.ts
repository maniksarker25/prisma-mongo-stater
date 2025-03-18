import { UserRole } from "@prisma/client/wasm";
import prisma from "../src/app/utils/prisma";
import bcrypt from "bcrypt";

const seedSuperAdmin = async () => {
  try {
    const isExistsSuperAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });
    if (isExistsSuperAdmin) {
      console.log("Super admin is already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("superadmin", 12);
    // const createSuperAdmin = await prisma.user.create({
    //   data: {
    //     email: "super@gmail.com",
    //     password: hashedPassword,
    //     role: UserRole.SUPER_ADMIN,

    //     superAdmin: {
    //       create: {
    //         name: "Super Admin",
    //         email: "super@gmail.com",
    //       },
    //     },
    //   },
    // });
    const createSuperAdmin = await prisma.user.create({
      data: {
        email: "super@gmail.com",
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        superAdmin: {
          // Here is the key: superAdmin is used for creating the related SuperAdmin.
          create: {
            name: "Super Admin",
            email: "super@gmail.com",
          },
        },
      },
    });

    console.log("super admin created successfully", createSuperAdmin);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
