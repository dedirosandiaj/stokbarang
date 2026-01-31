import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ CRITICAL: DATABASE_URL is missing or empty!");
} else {
    console.log("✅ Database connecting to:", connectionString.split("@")[1] || "unknown host"); // Log only host for security
}

const client = postgres(connectionString || "postgres://dummy:dummy@localhost:5432/dummy");
export const db = drizzle(client, { schema });
