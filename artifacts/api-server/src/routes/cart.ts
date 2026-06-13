import { Router } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { AddToCartBody, UpdateCartItemBody, RemoveFromCartBody } from "@workspace/api-zod";

const router = Router();

async function buildCart(userId: number) {
  const items = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      product: {
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        category: productsTable.category,
        stock: productsTable.stock,
        imageUrl: productsTable.imageUrl,
      },
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const mapped = items.map(item => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      price: parseFloat(item.product.price),
      category: item.product.category,
      stock: item.product.stock,
      imageUrl: item.product.imageUrl,
    },
  }));

  const total = mapped.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { items: mapped, total: parseFloat(total.toFixed(2)) };
}

router.get("/cart", authMiddleware, async (req: AuthRequest, res) => {
  const cart = await buildCart(req.userId!);
  res.json(cart);
});

router.post("/cart/add", authMiddleware, async (req: AuthRequest, res) => {
  const result = AddToCartBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: "Неверные данные" });
    return;
  }
  const { productId, quantity } = result.data;
  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, req.userId!), eq(cartItemsTable.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing[0]!.quantity + quantity })
      .where(eq(cartItemsTable.id, existing[0]!.id));
  } else {
    await db.insert(cartItemsTable).values({ userId: req.userId!, productId, quantity });
  }

  const cart = await buildCart(req.userId!);
  res.json(cart);
});

router.post("/cart/update", authMiddleware, async (req: AuthRequest, res) => {
  const result = UpdateCartItemBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: "Неверные данные" });
    return;
  }
  const { cartItemId, quantity } = result.data;
  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, cartItemId), eq(cartItemsTable.userId, req.userId!)));
  } else {
    await db.update(cartItemsTable).set({ quantity }).where(and(eq(cartItemsTable.id, cartItemId), eq(cartItemsTable.userId, req.userId!)));
  }
  const cart = await buildCart(req.userId!);
  res.json(cart);
});

router.delete("/cart/remove", authMiddleware, async (req: AuthRequest, res) => {
  const result = RemoveFromCartBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: "Неверные данные" });
    return;
  }
  const { cartItemId } = result.data;
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, cartItemId), eq(cartItemsTable.userId, req.userId!)));
  const cart = await buildCart(req.userId!);
  res.json(cart);
});

export default router;
