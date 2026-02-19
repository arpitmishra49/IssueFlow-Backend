import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";

const app = express();

/* ==============================
   Global Middlewares
============================== */

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// Body parser
app.use(express.json());

// Prevent NoSQL injection
// app.use(mongoSanitize());

// Prevent XSS
//app.use(xssClean());

// Logging in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ==============================
   Test Route
============================== */

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "IssueFlow API is running 🚀",
  });
});

export default app;
