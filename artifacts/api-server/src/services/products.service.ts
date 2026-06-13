import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface ProductDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
}

function toDTO(p: typeof productsTable.$inferSelect): ProductDTO {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    category: p.category,
    stock: p.stock,
    imageUrl: p.imageUrl,
  };
}

export class ProductsService {
  async findAll(category?: string): Promise<ProductDTO[]> {
    const rows = category
      ? await db.select().from(productsTable).where(eq(productsTable.category, category))
      : await db.select().from(productsTable);
    return rows.map(toDTO);
  }

  async findCategories(): Promise<string[]> {
    const rows = await db.selectDistinct({ category: productsTable.category }).from(productsTable);
    return rows.map(r => r.category);
  }

  async findById(id: number): Promise<ProductDTO | null> {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);
    return product ? toDTO(product) : null;
  }
}

export const productsService = new ProductsService();
