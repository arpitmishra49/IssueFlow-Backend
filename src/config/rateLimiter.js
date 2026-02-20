import rateLimit from "express-rate-limit";

/**
 * Global API Rate Limiter
 * Limits repeated requests to public APIs
 */
const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // default 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // default 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests from this IP, please try again later.",
  },
});

export default apiRateLimiter;