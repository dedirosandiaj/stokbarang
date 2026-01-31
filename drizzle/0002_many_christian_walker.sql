CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"kode_barang" text NOT NULL,
	"nama_barang" text NOT NULL,
	"gramasi" integer,
	"satuan" text,
	"harga" integer NOT NULL,
	"stok" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_kode_barang_unique" UNIQUE("kode_barang")
);
