import * as projectService from "../services/project.service.js";

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(
      req.body,
      req.user.id
    );

    res.status(201).json({
      status: "success",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user.id);

    res.status(200).json({
      status: "success",
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);

    res.status(200).json({
      status: "success",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const project = await projectService.addMemberToProject(
      req.params.id,
      req.body.userId
    );

    res.status(200).json({
      status: "success",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
