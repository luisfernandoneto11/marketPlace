import { Router } from "express";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { cartController } from "../controllers/cart.controller";
import { type Request, type Response } from "express";

const router = Router();

router.get("/cart", authMiddleware, (req, res) =>
  cartController.getCart(req as AuthRequest, res),
);
router.post("/cart/add", authMiddleware, (req, res) =>
  cartController.addItem(req as AuthRequest, res),
);
router.post("/cart/update", authMiddleware, (req, res) =>
  cartController.updateItem(req as AuthRequest, res),
);
router.delete("/cart/remove", authMiddleware, (req, res) =>
  cartController.removeItem(req as AuthRequest, res),
);

export default router;
