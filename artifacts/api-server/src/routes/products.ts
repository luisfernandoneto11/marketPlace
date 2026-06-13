import { Router } from "express";
import { productsController } from "../controllers/products.controller";

const router = Router();

router.get("/products/categories", (req, res) => productsController.getCategories(req, res));
router.get("/products/:id", (req, res) => productsController.getById(req, res));
router.get("/products", (req, res) => productsController.getAll(req, res));

export default router;
