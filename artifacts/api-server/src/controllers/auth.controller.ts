import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const result = RegisterBody.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Неверные данные" });
      return;
    }
    try {
      const data = await authService.register(result.data);
      res.status(201).json(data);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "CONFLICT") {
        res.status(409).json({ message: (err as Error).message });
      } else {
        req.log.error(err);
        res.status(500).json({ message: "Внутренняя ошибка сервера" });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = LoginBody.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Неверные данные" });
      return;
    }
    try {
      const data = await authService.login(result.data);
      res.json(data);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "UNAUTHORIZED") {
        res.status(401).json({ message: (err as Error).message });
      } else {
        req.log.error(err);
        res.status(500).json({ message: "Внутренняя ошибка сервера" });
      }
    }
  }
}

export const authController = new AuthController();
