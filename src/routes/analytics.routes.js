import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import { param } from "express-validator";

import { getProjectAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get(
  "/:projectId",
  authenticate,
  param("projectId").isMongoId().withMessage("Invalid project ID"),
  validate,
  getProjectAnalytics
);

export default router;