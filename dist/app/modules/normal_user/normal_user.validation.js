"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const updateNormalUserDataValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().nonempty("Name is required").optional(),
        phone: zod_1.z.string().optional(),
        gender: zod_1.z.enum([client_1.Gender.FEMALE, client_1.Gender.MALE]).optional(),
    }),
});
const normalUserValidations = {
    updateNormalUserDataValidationSchema,
};
exports.default = normalUserValidations;
