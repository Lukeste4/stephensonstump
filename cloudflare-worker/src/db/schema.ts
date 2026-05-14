import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const quotesTable = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  notes: text("notes").notNull().default(""),
  stumpCount: integer("stump_count").notNull(),
  servicePackage: text("service_package").notNull(),
  estimatedTotal: text("estimated_total").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Quote = typeof quotesTable.$inferSelect;
export type InsertQuote = typeof quotesTable.$inferInsert;
