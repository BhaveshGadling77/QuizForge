export function authorizeRoles(req, res, next) {
  let allowedRoles = ["admin", "user"]
  if (!req.user)
    return res.status(401).json({ error: "User not authenticated" });

  if (!allowedRoles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ error: "Access denied: insufficient permissions" });
  }

  next(); // user has permission, continue to route
}
