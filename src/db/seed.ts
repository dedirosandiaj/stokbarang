import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Seeding database...");

    const password = await bcrypt.hash("password123", 10);

    try {
        // Seed Admin
        await db.insert(users).values({
            username: "admin",
            password: password,
            role: "admin",
        }).onConflictDoNothing();

        // Seed Kasir
        await db.insert(users).values({
            username: "kasir",
            password: password,
            role: "kasir",
        }).onConflictDoNothing();

        console.log("Users (Admin & Kasir) seeded successfully");
    } catch (error) {
        console.error("Error seeding user:", error);
    }

    process.exit(0);
}

main();
