import authRoutes from "./routes/auth.routes.js";
import express from "express";
import adminRoutes from "./routes/adminQuiz.routes.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { requestLogger } from "./middlewares/logger.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware.js";

const app = express();

//built-in middlewares
app.use(express.json());

app.use(
  cors({
    origin:
      process.env.NODE_ENV == "production" ? process.env.FRONTEND_URL : true,
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use(requestLogger);

//auth routes
app.use("/api/auth", authRoutes);

//admin routes
app.use("/api/admin/", adminRoutes);

//debugging
// console.log("authRoutes:", authRoutes)
// console.log("adminRoutes:", adminRoutes)
// console.log("userRoutes:", userRoutes)

//user routes
app.use("/api", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is successfully running on Port ${process.env.PORT}`);
});
