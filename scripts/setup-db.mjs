import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required");
}

const schemaUrl = new URL("../db/schema.sql", import.meta.url);
const schema = await readFile(fileURLToPath(schemaUrl), "utf8");
const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);
const sql = neon(databaseUrl);

for (const statement of statements) {
  await sql.query(statement);
}

const [result] = await sql`
  SELECT to_regclass('public.coffee_notes') IS NOT NULL AS ready
`;

if (!result?.ready) {
  throw new Error("coffee_notes table was not created");
}

console.log("Neon schema is ready.");
