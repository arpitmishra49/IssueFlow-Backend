import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  addMember,
  deleteProject,
} from "../controllers/project.controller.js";

import authenticate from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/rbac.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import {
  createProjectValidator,
  projectIdValidator,
} from "../validators/project.validator.js";

const router = express.Router();

/**
 * Only admin & manager can create project
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "manager"),
  createProjectValidator,
  validate,
  createProject
);

/**
 * Get projects of logged-in user
 */
router.get("/", authenticate, getProjects);

/**
 * Get single project
 */
router.get(
  "/:id",
  authenticate,
  projectIdValidator,
  validate,
  getProject
);

/**
 * Add member (admin/manager only)
 */
router.patch(
  "/:id/add-member",
  authenticate,
  authorizeRoles("admin", "manager"),
  projectIdValidator,
  validate,
  addMember
);

/**
 * Delete project (admin only)
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  projectIdValidator,
  validate,
  deleteProject
);

export default router;
