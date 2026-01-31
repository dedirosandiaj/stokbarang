import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";
import postgres from "postgres";

async function main() {
    console.log("Running migrations...");
    const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
    // This will run migrations on the database, skipping the ones already applied
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations completed!");
    await migrationClient.end();
    process.exit(0);
}

main().catch((err) => {
    console.error("Migration failed!", err);
    process.exit(1);
});
