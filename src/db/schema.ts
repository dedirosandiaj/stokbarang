import { pgTable, text, timestamp, uuid, integer, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").unique().notNull(),
    password: text("password").notNull(),
    role: text("role", { enum: ["admin", "kasir"] }).default("kasir").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    brand: text("brand", { enum: ["nayyacorner", "inacookies"] }).notNull(),
    kodeBarang: text("kode_barang").notNull().unique(),
    namaBarang: text("nama_barang").notNull(),
    gramasi: integer("gramasi"),
    satuan: text("satuan"),
    harga: integer("harga").notNull(),
    stok: integer("stok").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date"
    }).notNull()
});
