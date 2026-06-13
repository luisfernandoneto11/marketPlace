import { Response } from "express";
import { cartService } from "../services/cart.service";
import { AddToCartBody, UpdateCartItemBody, RemoveFromCartBody } from "@workspace/api-zod";
import { type AuthRequest } from "../middlewares/auth";

export class CartController {
  async getCart(req: AuthRequest, res: Response): Promise<void> {
    const cart = await cartService.getCart(req.userId!);
    res.json(cart);
  }

  async addItem(req: AuthRequest, res: Response): Promise<void> {
    const result = AddToCartBody.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Неверные данные" });
      return;
    }
    const { productId, quantity } = result.data;
    const cart = await cartService.addItem(req.userId!, productId, quantity);
    res.json(cart);
  }

  async updateItem(req: AuthRequest, res: Response): Promise<void> {
    const result = UpdateCartItemBody.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Неверные данные" });
      return;
    }
    const { cartItemId, quantity } = result.data;
    const cart = await cartService.updateItem(req.userId!, cartItemId, quantity);
    res.json(cart);
  }

  async removeItem(req: AuthRequest, res: Response): Promise<void> {
    const result = RemoveFromCartBody.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Неверные данные" });
      return;
    }
    const { cartItemId } = result.data;
    const cart = await cartService.removeItem(req.userId!, cartItemId);
    res.json(cart);
  }
}

export const cartController = new CartController();
