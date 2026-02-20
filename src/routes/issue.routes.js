import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/rbac.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import {
  createIssueValidator,
  issueIdValidator,
} from "../validators/issue.validator.js";

import {
  createIssue,
  assignIssue,
  updateIssueStatus,
  getIssues,
} from "../controllers/issue.controller.js";

const router = express.Router();

// Create Issue (Tester only)
router.post(
  "/",
  authenticate,
  authorizeRoles("tester"),
  createIssueValidator,
  validate,
  createIssue
);

// Assign Issue (Manager/Admin)
router.patch(
  "/:id/assign",
  authenticate,
  authorizeRoles("admin", "manager"),
  issueIdValidator,
  validate,
  assignIssue
);

// Update Status
router.patch(
  "/:id/status",
  authenticate,
  issueIdValidator,
  validate,
  updateIssueStatus
);

// Get Issues
router.get("/", authenticate, getIssues);

export default router;