import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json(result);  // ✅ make consistent

  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    res.status(200).json(result);  // ✅ FIXED
  } catch (error) {
    next(error);
  }
};