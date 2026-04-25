import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function issueToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

