import { Response } from "express";
import { favoritesService } from "../services/favorites.service";
import { type AuthRequest } from "../middlewares/auth";

export class FavoritesController {
  async getFavorites(req: AuthRequest, res: Response): Promise<void> {
    const favorites = await favoritesService.getFavorites(req.userId!);
    res.json(favorites);
  }

  async addFavorite(req: AuthRequest, res: Response): Promise<void> {
    const productId = Number(req.body?.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      res.status(400).json({ message: "Неверные данные" });
      return;
    }
    const favorites = await favoritesService.addFavorite(req.userId!, productId);
    res.status(201).json(favorites);
  }

  async removeFavorite(req: AuthRequest, res: Response): Promise<void> {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      res.status(400).json({ message: "Неверный ID продукта" });
      return;
    }
    const favorites = await favoritesService.removeFavorite(req.userId!, productId);
    res.json(favorites);
  }
}

export const favoritesController = new FavoritesController();
