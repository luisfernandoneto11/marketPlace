import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../middlewares/auth";

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: { id: number; username: string; email: string };
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .limit(1);

    if (existing.length > 0) {
      const err = new Error("Пользователь с таким email уже существует");
      (err as NodeJS.ErrnoException).code = "CONFLICT";
      throw err;
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const [user] = await db
      .insert(usersTable)
      .values({ username: input.username, email: input.email, passwordHash })
      .returning();

    const token = signToken(user!.id);
    return { token, user: { id: user!.id, username: user!.username, email: user!.email } };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .limit(1);

    if (!user) {
      const err = new Error("Неверный email или пароль");
      (err as NodeJS.ErrnoException).code = "UNAUTHORIZED";
      throw err;
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      const err = new Error("Неверный email или пароль");
      (err as NodeJS.ErrnoException).code = "UNAUTHORIZED";
      throw err;
    }

    const token = signToken(user.id);
    return { token, user: { id: user.id, username: user.username, email: user.email } };
  }
}

export const authService = new AuthService();
