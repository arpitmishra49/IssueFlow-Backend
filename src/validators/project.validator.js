import { body, param } from "express-validator";

export const createProjectValidator = [
  body("name").notEmpty().withMessage("Project name is required"),
  body("description").optional().isString(),
];

export const projectIdValidator = [
  param("id").isMongoId().withMessage("Invalid project ID"),
];
