import Project from "../models/project.model.js";
import User from "../models/user.model.js";

/**
 * Create a new project
 */
export const createProject = async (data, userId) => {
  const project = await Project.create({
    ...data,
    owner: userId,
    members: [userId], // owner is automatically a member
  });

  return project;
};

/**
 * Get all projects for a user
 */
export const getUserProjects = async (userId) => {
  const projects = await Project.find({
    members: userId,
  }).populate("owner", "name email");

  return projects;
};

/**
 * Get single project by ID
 */
export const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("owner", "name email")
    .populate("members", "name email role");

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

/**
 * Add member to project
 */
export const addMemberToProject = async (projectId, email) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const isAlreadyMember = project.members
    .filter(Boolean)
    .some((member) => member.toString() === user._id.toString());

  if (!isAlreadyMember) {
    project.members.push(user._id);
    await project.save();
  }

  return await Project.findById(projectId)
    .populate("owner", "name email")
    .populate("members", "name email role");
};
/**
 * Delete project (only owner should call this)
 */
export const deleteProject = async (projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  await project.deleteOne();

  return { message: "Project deleted successfully" };
};
