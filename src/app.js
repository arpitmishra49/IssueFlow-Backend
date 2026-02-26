import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

import apiRateLimiter from "./config/rateLimiter.js";
import corsOptions from "./config/cors.config.js";
import sanitizeMiddleware from "./middlewares/sanitize.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

/* ==============================
   GLOBAL MIDDLEWARES
============================== */

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// Sanitize inputs
app.use(sanitizeMiddleware);

// Rate limiting
// app.use(apiRateLimiter);

// Logging (development only)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ==============================
   ROUTES
============================== */

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "IssueFlow API is running 🚀",
  });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

/* ==============================
   ERROR HANDLER (MUST BE LAST)
============================== */

app.use(errorHandler);

export default app;