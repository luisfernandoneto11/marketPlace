import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export interface CartItemDTO {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    imageUrl: string;
  };
}

export interface CartDTO {
  items: CartItemDTO[];
  total: number;
}

export class CartService {
  async getCart(userId: number): Promise<CartDTO> {
    const rows = await db
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

    const items: CartItemDTO[] = rows.map(r => ({
      id: r.id,
      productId: r.productId,
      quantity: r.quantity,
      product: {
        id: r.product.id,
        name: r.product.name,
        description: r.product.description,
        price: parseFloat(r.product.price),
        category: r.product.category,
        stock: r.product.stock,
        imageUrl: r.product.imageUrl,
      },
    }));

    const total = parseFloat(
      items.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toFixed(2),
    );

    return { items, total };
  }

  async addItem(userId: number, productId: number, quantity: number): Promise<CartDTO> {
    const existing = await db
      .select()
      .from(cartItemsTable)
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cartItemsTable)
        .set({ quantity: existing[0]!.quantity + quantity })
        .where(eq(cartItemsTable.id, existing[0]!.id));
    } else {
      await db.insert(cartItemsTable).values({ userId, productId, quantity });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: number, cartItemId: number, quantity: number): Promise<CartDTO> {
    if (quantity <= 0) {
      await db
        .delete(cartItemsTable)
        .where(and(eq(cartItemsTable.id, cartItemId), eq(cartItemsTable.userId, userId)));
    } else {
      await db
        .update(cartItemsTable)
        .set({ quantity })
        .where(and(eq(cartItemsTable.id, cartItemId), eq(cartItemsTable.userId, userId)));
    }
    return this.getCart(userId);
  }

  async removeItem(userId: number, cartItemId: number): Promise<CartDTO> {
    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.id, cartItemId), eq(cartItemsTable.userId, userId)));
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
