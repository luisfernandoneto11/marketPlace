import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/products", async (req, res) => {
  const category = req.query["category"] as string | undefined;
  const rows = category
    ? await db.select().from(productsTable).where(eq(productsTable.category, category))
    : await db.select().from(productsTable);

  res.json(rows.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    category: p.category,
    stock: p.stock,
    imageUrl: p.imageUrl,
  })));
});

router.get("/products/categories", async (req, res) => {
  const rows = await db.selectDistinct({ category: productsTable.category }).from(productsTable);
  res.json(rows.map(r => r.category));
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params["id"] ?? "0");
  if (isNaN(id)) {
    res.status(400).json({ message: "Неверный ID товара" });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!product) {
    res.status(404).json({ message: "Товар не найден" });
    return;
  }
  res.json({
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    category: product.category,
    stock: product.stock,
    imageUrl: product.imageUrl,
  });
});

export default router;
