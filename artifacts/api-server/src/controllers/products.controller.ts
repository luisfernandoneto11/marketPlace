import { Request, Response } from "express";
import { productsService } from "../services/products.service";

export class ProductsController {
  async getAll(req: Request, res: Response): Promise<void> {
    const category = req.query["category"] as string | undefined;
    const products = await productsService.findAll(category);
    res.json(products);
  }

  async getCategories(_req: Request, res: Response): Promise<void> {
    const categories = await productsService.findCategories();
    res.json(categories);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(String(req.params["id"] ?? "0"));
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: "Неверный ID товара" });
      return;
    }
    const product = await productsService.findById(id);
    if (!product) {
      res.status(404).json({ message: "Товар не найден" });
      return;
    }
    res.json(product);
  }
}

export const productsController = new ProductsController();
