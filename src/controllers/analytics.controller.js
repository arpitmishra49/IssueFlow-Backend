import * as analyticsService from "../services/analytics.service.js";

export const getProjectAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getProjectAnalytics(
      req.params.projectId,
      req.user
    );

    res.status(200).json({
      status: "success",
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};