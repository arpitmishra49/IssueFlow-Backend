import { body, param } from "express-validator";
//Validator
export const createIssueValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("severity")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid severity"),
  body("project").isMongoId().withMessage("Valid project ID required"),
];

export const issueIdValidator = [
  param("id").isMongoId().withMessage("Invalid issue ID"),
];