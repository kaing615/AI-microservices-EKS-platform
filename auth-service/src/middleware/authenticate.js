import { verifyToken } from "../services/tokenService.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "missing bearer token" });
  }

  try {
    req.user = verifyToken(authHeader.slice(7));
    return next();
  } catch (error) {
    return res.status(401).json({
      valid: false,
      message: error.message
    });
  }
}

