import { Router } from "express";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { favoritesController } from "../controllers/favorites.controller";

const router = Router();

router.get("/favorites", authMiddleware, (req, res) =>
  favoritesController.getFavorites(req as AuthRequest, res),
);

router.post("/favorites", authMiddleware, (req, res) =>
  favoritesController.addFavorite(req as AuthRequest, res),
);

router.delete("/favorites/:productId", authMiddleware, (req, res) =>
  favoritesController.removeFavorite(req as AuthRequest, res),
);

export default router;
