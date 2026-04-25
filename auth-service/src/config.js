import "dotenv/config";
import path from "path";

export const config = {
  port: Number(process.env.AUTH_PORT || 4001),
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  usersFile: process.env.AUTH_USERS_FILE || path.resolve(process.cwd(), "data/users.json")
};
