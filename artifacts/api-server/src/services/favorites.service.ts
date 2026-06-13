import { db, favoritesTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export interface FavoriteProductDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
}

export class FavoritesService {
  async getFavorites(userId: number): Promise<FavoriteProductDTO[]> {
    const rows = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        category: productsTable.category,
        stock: productsTable.stock,
        imageUrl: productsTable.imageUrl,
      })
      .from(favoritesTable)
      .innerJoin(productsTable, eq(favoritesTable.productId, productsTable.id))
      .where(eq(favoritesTable.userId, userId));

    return rows.map((r) => ({
      ...r,
      price: parseFloat(r.price),
    }));
  }

  async addFavorite(userId: number, productId: number): Promise<FavoriteProductDTO[]> {
    const existing = await db
      .select()
      .from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, productId)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(favoritesTable).values({ userId, productId });
    }

    return this.getFavorites(userId);
  }

  async removeFavorite(userId: number, productId: number): Promise<FavoriteProductDTO[]> {
    await db
      .delete(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, productId)));

    return this.getFavorites(userId);
  }

  async isFavorite(userId: number, productId: number): Promise<boolean> {
    const rows = await db
      .select()
      .from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, productId)))
      .limit(1);
    return rows.length > 0;
  }
}

export const favoritesService = new FavoritesService();
