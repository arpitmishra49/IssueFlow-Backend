import * as issueService from "../services/issue.service.js";

export const createIssue = async (req, res, next) => {
  try {
    const issue = await issueService.createIssue(req.body, req.user);

    res.status(201).json({
      status: "success",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const assignIssue = async (req, res, next) => {
  try {
    const issue = await issueService.assignIssue(
      req.params.id,
      req.body.developerId,
      req.user
    );

    res.status(200).json({
      status: "success",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIssueStatus = async (req, res, next) => {
  try {
    const issue = await issueService.updateIssueStatus(
      req.params.id,
      req.body.status,
      req.user
    );

    res.status(200).json({
      status: "success",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const getIssues = async (req, res, next) => {
  try {
    const issues = await issueService.getProjectIssues(
      req.query.projectId,
      req.user.id
    );

    res.status(200).json({
      status: "success",
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};