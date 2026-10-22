import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 환경변수가 설정되어 있지 않습니다.");
}

export const db = drizzle(neon(process.env.DATABASE_URL), { schema });
