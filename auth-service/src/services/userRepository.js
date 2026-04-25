import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { config } from "../config.js";
import { hashPassword } from "./passwordService.js";

const seedUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin"
  },
  {
    id: "2",
    name: "Demo User",
    email: "user@example.com",
    password: "user123",
    role: "user"
  }
];

async function ensureDataFile() {
  await fs.mkdir(path.dirname(config.usersFile), { recursive: true });

  try {
    await fs.access(config.usersFile);
  } catch {
    const users = seedUsers.map((user) => {
      const { salt, passwordHash } = hashPassword(user.password);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        salt,
        passwordHash,
        createdAt: new Date().toISOString()
      };
    });
    await fs.writeFile(config.usersFile, JSON.stringify(users, null, 2));
  }
}

export async function listUsers() {
  await ensureDataFile();
  const raw = await fs.readFile(config.usersFile, "utf8");
  return JSON.parse(raw);
}

export async function findUserByEmail(email) {
  const users = await listUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  const users = await listUsers();
  return users.find((user) => user.id === id) || null;
}

export async function createUser({ name, email, password, role = "user" }) {
  const users = await listUsers();
  const existing = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return null;
  }

  const { salt, passwordHash } = hashPassword(password);
  const user = {
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    role,
    salt,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  await fs.writeFile(config.usersFile, JSON.stringify(users, null, 2));
  return user;
}

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

