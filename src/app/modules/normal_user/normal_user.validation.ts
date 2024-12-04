import { Gender } from "@prisma/client";
import { z } from "zod";

const updateNormalUserDataValidationSchema = z.object({
  body: z.object({
    name: z.string().nonempty("Name is required").optional(),
    phone: z.string().optional(),
    gender: z.enum([Gender.FEMALE, Gender.MALE]).optional(),
  }),
});

const normalUserValidations = {
  updateNormalUserDataValidationSchema,
};

export default normalUserValidations;
