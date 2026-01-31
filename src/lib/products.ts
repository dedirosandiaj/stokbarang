"use server";
import { db } from "~/db";
import { products } from "~/db/schema";
import { eq, desc } from "drizzle-orm";

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export async function getProducts() {
    // "use server"; removed
    return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProduct(id: string) {
    // "use server"; removed
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
}

export async function createProduct(data: NewProduct) {
    // "use server"; removed
    try {
        await db.insert(products).values(data);
        return { success: true };
    } catch (error) {
        console.error("Create product error:", error);
        return { success: false, error: "Failed to create product" };
    }
}

export async function updateProduct(id: string, data: Partial<NewProduct>) {
    // "use server"; removed
    try {
        await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));
        return { success: true };
    } catch (error) {
        console.error("Update product error:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteProduct(id: string) {
    // "use server"; removed
    try {
        await db.delete(products).where(eq(products.id, id));
        return { success: true };
    } catch (error) {
        console.error("Delete product error:", error);
        return { success: false, error: "Failed to delete product" };
    }
}
