"use server";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export async function getUsers() {
    // "use server"; removed
    return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUser(id: string) {
    // "use server"; removed
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
}

export async function createUser(data: NewUser) {
    // "use server"; removed
    try {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await db.insert(users).values({
            ...data,
            password: hashedPassword,
        });
        return { success: true };
    } catch (error) {
        console.error("Create user error:", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function updateUser(id: string, data: Partial<NewUser>) {
    // "use server"; removed
    try {
        const updateData: Partial<NewUser> = { ...data };

        // If password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        await db.update(users).set(updateData).where(eq(users.id, id));
        return { success: true };
    } catch (error) {
        console.error("Update user error:", error);
        return { success: false, error: "Failed to update user" };
    }
}

export async function deleteUser(id: string) {
    // "use server"; removed
    try {
        await db.delete(users).where(eq(users.id, id));
        return { success: true };
    } catch (error) {
        console.error("Delete user error:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
