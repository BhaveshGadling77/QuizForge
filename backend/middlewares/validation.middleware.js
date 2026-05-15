/**
 * Input Validation Middleware
 * Validates and sanitizes request data
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation: min 6 chars, at least one uppercase, one lowercase, one number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;

// Sanitize string input (trim and remove harmful characters)
export function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
}

// Validate email
export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required and must be a string");
  }

  const sanitized = sanitizeString(email).toLowerCase();
  if (!EMAIL_REGEX.test(sanitized)) {
    throw new Error("Invalid email format");
  }

  return sanitized;
}

// Validate password
export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    throw new Error("Password is required and must be a string");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  if (!PASSWORD_REGEX.test(password)) {
    throw new Error("Password must contain uppercase, lowercase, and numbers");
  }

  return password;
}

// Validate name
export function validateName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Name is required and must be a string");
  }

  const sanitized = sanitizeString(name);
  if (sanitized.length < 2) {
    throw new Error("Name must be at least 2 characters long");
  }

  if (sanitized.length > 50) {
    throw new Error("Name must not exceed 50 characters");
  }

  return sanitized;
}

// Validate quiz data
export function validateQuizData(data) {
  const errors = [];

  if (!data.title || typeof data.title !== "string") {
    errors.push("Quiz title is required");
  } else if (sanitizeString(data.title).length < 3) {
    errors.push("Quiz title must be at least 3 characters long");
  }

  if (!data.description || typeof data.description !== "string") {
    errors.push("Quiz description is required");
  } else if (sanitizeString(data.description).length < 10) {
    errors.push("Quiz description must be at least 10 characters long");
  }

  if (
    data.timeLimit &&
    (typeof data.timeLimit !== "number" || data.timeLimit < 1)
  ) {
    errors.push("Time limit must be a positive number");
  }

  if (data.visibility && !["public", "private"].includes(data.visibility)) {
    errors.push("Visibility must be either public or private");
  }

  return errors;
}

// Validate question data
export function validateQuestionData(data) {
  const errors = [];

  if (!data.title || typeof data.title !== "string") {
    errors.push("Question title is required");
  } else if (sanitizeString(data.title).length < 5) {
    errors.push("Question must be at least 5 characters long");
  }

  if (!Array.isArray(data.options) || data.options.length < 2) {
    errors.push("At least 2 options are required");
  }

  if (
    typeof data.correctOptionIndex !== "number" ||
    data.correctOptionIndex < 0
  ) {
    errors.push("Valid correct option index is required");
  }

  if (data.correctOptionIndex >= (data.options?.length || 0)) {
    errors.push("Correct option index is out of range");
  }

  return errors;
}

// Middleware to validate registration data
export function validateRegistration(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    req.body.email = validateEmail(email);
    req.body.name = validateName(name);
    req.body.password = validatePassword(password);

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Middleware to validate login data
export function validateLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    req.body.email = validateEmail(email);

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Middleware to validate quiz creation
export function validateQuizCreation(req, res, next) {
  try {
    const errors = validateQuizData(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Middleware to validate question creation
export function validateQuestionCreation(req, res, next) {
  try {
    const errors = validateQuestionData(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
