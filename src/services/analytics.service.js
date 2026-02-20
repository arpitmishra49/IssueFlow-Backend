import mongoose from "mongoose";
import Issue from "../models/issue.model.js";
import Project from "../models/project.model.js";

/**
 * Ensure user is a member of the project
 */
const ensureProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.members.includes(userId)) {
    throw new Error("Not authorized for this project");
  }

  return project;
};

/**
 * Get analytics for a specific project
 */
export const getProjectAnalytics = async (projectId, user) => {
  // Ensure access
  await ensureProjectAccess(projectId, user.id);

  const objectProjectId = new mongoose.Types.ObjectId(projectId);

  // 1️⃣ Total Issues
  const totalIssues = await Issue.countDocuments({
    project: objectProjectId,
  });

  // 2️⃣ Issues by Status
  const issuesByStatus = await Issue.aggregate([
    { $match: { project: objectProjectId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // 3️⃣ Issues by Severity
  const issuesBySeverity = await Issue.aggregate([
    { $match: { project: objectProjectId } },
    {
      $group: {
        _id: "$severity",
        count: { $sum: 1 },
      },
    },
  ]);

  // 4️⃣ Developer Workload
  const developerWorkload = await Issue.aggregate([
    { $match: { project: objectProjectId, assignedTo: { $ne: null } } },
    {
      $group: {
        _id: "$assignedTo",
        count: { $sum: 1 },
      },
    },
  ]);

  // 5️⃣ Average Resolution Time (Closed Issues Only)
  const resolutionTime = await Issue.aggregate([
    {
      $match: {
        project: objectProjectId,
        status: "closed",
      },
    },
    {
      $project: {
        resolutionTime: {
          $subtract: ["$updatedAt", "$createdAt"],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgResolutionTime: { $avg: "$resolutionTime" },
      },
    },
  ]);

  return {
    totalIssues,
    issuesByStatus,
    issuesBySeverity,
    developerWorkload,
    averageResolutionTime:
      resolutionTime.length > 0
        ? resolutionTime[0].avgResolutionTime
        : 0,
  };
};