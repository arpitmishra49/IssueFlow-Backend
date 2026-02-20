import Issue from "../models/issue.model.js";
import Project from "../models/project.model.js";

/**
 * Ensure user is member of project
 */
const checkProjectMembership = async (projectId, userId) => {
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

  issue.assignedTo = developerId;
  issue.status = "assigned";

  await issue.save();

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

  // Workflow control
  if (newStatus === "in-progress" && user.role !== "developer") {
    throw new Error("Only developers can start work");
  }

  if (newStatus === "resolved" && user.role !== "developer") {
    throw new Error("Only developers can resolve issues");
  }

  if (newStatus === "closed" && user.role !== "tester") {
    throw new Error("Only testers can close issues");
  }

  issue.status = newStatus;
  await issue.save();

  return issue;
};

/**
 * Get Issues for a project
 */
export const getProjectIssues = async (projectId, userId) => {
  await checkProjectMembership(projectId, userId);

  return Issue.find({ project: projectId })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");
};