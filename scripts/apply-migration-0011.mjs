import pg from "pg";
import fs from "node:fs";

function loadEnv() {
  if (fs.existsSync(".env.local")) {
    const text = fs.readFileSync(".env.local", "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    }
  }
}

loadEnv();

const { Client } = pg;
const connectionString = process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  console.error("SUPABASE_DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL.");

  const sql = fs.readFileSync("supabase/migrations/0011_production_hardening.sql", "utf8");
  console.log("Applying migration 0011_production_hardening.sql...");

  await client.query(sql);
  console.log("Migration 0011 applied successfully!");

  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
