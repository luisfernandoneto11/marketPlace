import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const result = RegisterBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: "Неверные данные" });
    return;
  }
  const { username, email, password } = result.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ message: "Пользователь с таким email уже существует" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ username, email, passwordHash }).returning();
  const token = signToken(user.id);
  res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

router.post("/auth/login", async (req, res) => {
  const result = LoginBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: "Неверные данные" });
    return;
  }
  const { email, password } = result.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ message: "Неверный email или пароль" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Неверный email или пароль" });
    return;
  }
  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

export default router;
