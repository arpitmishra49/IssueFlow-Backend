import mongoose from "mongoose";
import Issue from "../models/issue.model.js";
import Project from "../models/project.model.js";
import ActivityLog from "../models/activityLog.model.js";

/**
 * Ensure user is member of project
 */
const checkProjectMembership = async (projectId, userId) => {
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

  // ✅ RETURN POPULATED ISSUE
  return await Issue.findById(issue._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email")
    .populate({
      path: "project",
      select: "name members",
      populate: {
        path: "members",
        select: "name email role",
      },
    });
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
  const isUnassigning = !developerId; // null/undefined/empty string means unassign

  if (isUnassigning) {
    issue.assignedTo = undefined; // unset the field cleanly in Mongoose
  } else {
    issue.assignedTo = new mongoose.Types.ObjectId(String(developerId));
  }

  // When unassigning, reset status to open so it re-enters the workflow
  if (isUnassigning) {
    issue.status = "open";
  }

  await issue.save();

  await ActivityLog.create({
    issue: issue._id,
    action: isUnassigning ? "ISSUE_UNASSIGNED" : "ISSUE_ASSIGNED",
    from: previousStatus,
    to: issue.status,
    performedBy: user.id,
  });

  // ✅ RETURN POPULATED ISSUE
  return await Issue.findById(issueId)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email")
    .populate({
      path: "project",
      select: "name members",
      populate: {
        path: "members",
        select: "name email role",
      },
    });
};

/**
 * Update Issue Status
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

  // ✅ RETURN POPULATED ISSUE
  return await Issue.findById(issueId)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email")
    .populate({
      path: "project",
      select: "name members",
      populate: {
        path: "members",
        select: "name email role",
      },
    });
};

/**
 * Delete Issue (admin only)
 */
export const deleteIssue = async (issueId) => {
  const issue = await Issue.findById(issueId);
  if (!issue) throw new Error("Issue not found");
  await Issue.findByIdAndDelete(issueId);
  await ActivityLog.deleteMany({ issue: issueId });
  return { id: issueId };
};

/**
 * Get Issues
 */
export const getProjectIssues = async (projectId, userId, userRole) => {
  const populateOptions = [
    { path: "assignedTo", select: "name email role" },
    { path: "createdBy", select: "name email" },
    {
      path: "project",
      select: "name members",
      populate: { path: "members", select: "name email role" },
    },
  ];

  // Developer: only see issues explicitly assigned to them
  if (userRole === "developer") {
    const query = { assignedTo: userId };
    if (projectId) {
      await checkProjectMembership(projectId, userId);
      query.project = projectId;
    }
    return Issue.find(query)
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2]);
  }

  // Admin: full access — all issues, or scoped to a project
  if (userRole === "admin") {
    const query = projectId ? { project: projectId } : {};
    return Issue.find(query)
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2])
      .sort({ createdAt: -1 });
  }

  // Other roles: project-scoped or all member projects
  if (projectId) {
    await checkProjectMembership(projectId, userId);
    return Issue.find({ project: projectId })
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2]);
  }

  const projects = await Project.find({ members: userId }).select("_id");
  const projectIds = projects.map((p) => p._id);

  return Issue.find({ project: { $in: projectIds } })
    .populate(populateOptions[0])
    .populate(populateOptions[1])
    .populate(populateOptions[2]);
};