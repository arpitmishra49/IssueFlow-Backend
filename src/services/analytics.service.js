import mongoose from "mongoose";
import Issue from "../models/issue.model.js";
import Project from "../models/project.model.js";
import ActivityLog from "../models/activityLog.model.js";

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

export const getProjectAnalytics = async (projectId, user) => {
  await ensureProjectAccess(projectId, user.id);

  const objectProjectId = new mongoose.Types.ObjectId(projectId);

  const totalIssues = await Issue.countDocuments({
    project: objectProjectId,
  });

  const issuesByStatus = await Issue.aggregate([
    { $match: { project: objectProjectId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const issuesBySeverity = await Issue.aggregate([
    { $match: { project: objectProjectId } },
    {
      $group: {
        _id: "$severity",
        count: { $sum: 1 },
      },
    },
  ]);

  const developerWorkload = await Issue.aggregate([
    { $match: { project: objectProjectId, assignedTo: { $ne: null } } },
    {
      $group: {
        _id: "$assignedTo",
        count: { $sum: 1 },
      },
    },
  ]);

  /**
   * Average Resolution Time using ActivityLog
   * (Time between ISSUE_CREATED and ISSUE_CLOSED)
   */

  const resolutionLogs = await ActivityLog.aggregate([
    {
      $lookup: {
        from: "issues",
        localField: "issue",
        foreignField: "_id",
        as: "issueData",
      },
    },
    { $unwind: "$issueData" },
    {
      $match: {
        "issueData.project": objectProjectId,
        action: "ISSUE_CLOSED",
      },
    },
    {
      $project: {
        issue: 1,
        closedAt: "$createdAt",
      },
    },
  ]);

  let totalResolutionTime = 0;
  let count = 0;

  for (const log of resolutionLogs) {
    const issue = await Issue.findById(log.issue);

    if (issue) {
      const resolutionTime =
        new Date(log.closedAt) - new Date(issue.createdAt);

      totalResolutionTime += resolutionTime;
      count++;
    }
  }

  const averageResolutionTime =
    count > 0 ? totalResolutionTime / count : 0;

  return {
    totalIssues,
    issuesByStatus,
    issuesBySeverity,
    developerWorkload,
    averageResolutionTime,
  };
};