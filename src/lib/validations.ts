
import { z } from "zod";

// Product Schema
export const productSchema = z.object({
    brand: z.enum(["nayyacorner", "inacookies"], {
        message: "Please select a valid brand",
    }),
    kodeBarang: z.string().min(1, "Product code is required"),
    namaBarang: z.string().min(1, "Product name is required"),
    gramasi: z.number().nullable().optional(),
    satuan: z.string().nullable().optional(),
    harga: z.number().min(0, "Price must be non-negative"),
    stok: z.number().int().min(0, "Stock must be non-negative"),
});

export type ProductInput = z.infer<typeof productSchema>;

// User Schema for Creation
export const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "kasir"]).default("kasir"),
});

// User Schema for Update
export const updateUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    role: z.enum(["admin", "kasir"]).default("kasir"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Login Schema
export const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
