/**
 * Request Logging Middleware
 * Logs all incoming requests and their responses
 */

import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logsDir = "logs";
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get current date for log file
function getLogFileName() {
  const date = new Date().toISOString().split("T")[0];
  return path.join(logsDir, `${date}.log`);
}

// Format log message
function formatLogMessage(data) {
  return `[${data.timestamp}] ${data.level} - ${data.method} ${data.url} - Status: ${data.status} - User: ${data.user} - Duration: ${data.duration}ms\n`;
}

// Write to log file
function writeLog(level, data) {
  const logMessage = formatLogMessage({ ...data, level });
  const fileName = getLogFileName();

  fs.appendFileSync(fileName, logMessage, "utf8");

  // Also log to console in development
  if (process.env.NODE_ENV === "development") {
    const color =
      level === "ERROR"
        ? "\x1b[31m"
        : level === "WARN"
          ? "\x1b[33m"
          : "\x1b[36m";
    const reset = "\x1b[0m";
    console.log(`${color}${logMessage}${reset}`);
  }
}

// Request logger middleware
export function requestLogger(req, res, next) {
  const startTime = Date.now();
  const originalSend = res.send;

  // Capture response
  res.send = function (data) {
    const duration = Date.now() - startTime;

    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      user: req.user?.id || "anonymous",
      duration,
    };

    // Log warnings for slow requests (>1000ms)
    if (duration > 1000) {
      writeLog("WARN", logData);
    } else {
      writeLog("INFO", logData);
    }

    return originalSend.call(this, data);
  };

  next();
}

// Error logger
export function logError(error, req) {
  const logData = {
    timestamp: new Date().toISOString(),
    level: "ERROR",
    method: req.method,
    url: req.originalUrl,
    status: error.statusCode || 500,
    user: req.user?.id || "anonymous",
    message: error.message,
    stack: error.stack,
  };

  const fileName = getLogFileName();
  const errorLog = `[${logData.timestamp}] ERROR - ${logData.method} ${logData.url} - ${logData.message}\nStack: ${logData.stack}\n\n`;

  fs.appendFileSync(fileName, errorLog, "utf8");

  if (process.env.NODE_ENV === "development") {
    console.error("\x1b[31m" + errorLog + "\x1b[0m");
  }
}

// Endpoint access logger
export function logEndpointAccess(req, endpoint) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    endpoint,
    user: req.user?.id || "anonymous",
    ip: req.ip,
  };

  console.log("[API Access]", logData);
}
