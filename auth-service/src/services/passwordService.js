import crypto from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const passwordHash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return {
    salt,
    passwordHash
  };
}

export function verifyPassword(password, passwordHash, salt) {
  const derived = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(passwordHash, "hex"));
}

