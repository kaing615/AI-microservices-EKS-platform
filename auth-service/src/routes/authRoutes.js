import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  toPublicUser
} from "../services/userRepository.js";
import { verifyPassword } from "../services/passwordService.js";
import { issueToken } from "../services/tokenService.js";

const router = Router();

function validateRegistrationPayload({ name, email, password }) {
  if (!name || !email || !password) {
    return "name, email, and password are required";
  }
  if (!email.includes("@")) {
    return "email format is invalid";
  }
  if (password.length < 6) {
    return "password must be at least 6 characters";
  }
  return null;
}

router.post("/register", async (req, res, next) => {
  try {
    const message = validateRegistrationPayload(req.body);
    if (message) {
      return res.status(400).json({ message });
    }

    const user = await createUser(req.body);
    if (!user) {
      return res.status(409).json({ message: "email already exists" });
    }

    return res.status(201).json({
      message: "user registered",
      user: toPublicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    return res.json({
      token: issueToken(user),
      user: toPublicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/validate", authenticate, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ valid: false, message: "user not found" });
    }

    return res.json({
      valid: true,
      user: toPublicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.json({
      user: toPublicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

