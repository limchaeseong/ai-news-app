import { defineConfig } from "drizzle-kit";

// drizzle-kit은 .env.local을 자동으로 읽지 않으므로 직접 로드한다.
process.loadEnvFile(".env.local");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL이 .env.local에 설정되어 있지 않습니다.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
