import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "missing bearer token" });
  }

  try {
    req.user = jwt.verify(authHeader.slice(7), config.jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

