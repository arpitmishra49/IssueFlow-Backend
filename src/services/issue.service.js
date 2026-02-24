import mongoose from "mongoose";
import Issue from "../models/issue.model.js";
import Project from "../models/project.model.js";
import ActivityLog from "../models/activityLog.model.js";

/**
 * Ensure user is member of project
 */
const checkProjectMembership = async (projectId, userId) => {
  // ✅ Prevent invalid ObjectId causing 400 CastError
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid project ID is required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.members.includes(userId)) {
    throw new Error("Not a member of this project");
  }

  return project;
};

/**
 * Create Issue
 */
export const createIssue = async (data, user) => {
  await checkProjectMembership(data.project, user.id);

  const issue = await Issue.create({
    ...data,
    createdBy: user.id,
  });

  await ActivityLog.create({
    issue: issue._id,
    action: "ISSUE_CREATED",
    performedBy: user.id,
  });

  return issue;
};

/**
 * Assign Issue
 */
export const assignIssue = async (issueId, developerId, user) => {
  const issue = await Issue.findById(issueId);

  if (!issue) {
    throw new Error("Issue not found");
  }

  const previousStatus = issue.status;

  issue.assignedTo = developerId;
  issue.status = "assigned";

  await issue.save();

  await ActivityLog.create({
    issue: issue._id,
    action: "ISSUE_ASSIGNED",
    from: previousStatus,
    to: "assigned",
    performedBy: user.id,
  });

  return issue;
};

/**
 * Update Issue Status (workflow controlled)
 */
export const updateIssueStatus = async (issueId, newStatus, user) => {
  const issue = await Issue.findById(issueId);

  if (!issue) {
    throw new Error("Issue not found");
  }

  const previousStatus = issue.status;

  issue.status = newStatus;
  await issue.save();

  await ActivityLog.create({
    issue: issue._id,
    action:
      newStatus === "closed" ? "ISSUE_CLOSED" : "STATUS_CHANGED",
    from: previousStatus,
    to: newStatus,
    performedBy: user.id,
  });

  return issue;
};

/**
 * Get Issues for a project
 */
export const getProjectIssues = async (projectId, userId) => {
  if (projectId) {
    await checkProjectMembership(projectId, userId);

    return Issue.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");
  }

  // If no projectId → return issues from projects where user is member
  const projects = await Project.find({ members: userId }).select("_id");

  const projectIds = projects.map((p) => p._id);

  return Issue.find({ project: { $in: projectIds } })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("project", "name");
};