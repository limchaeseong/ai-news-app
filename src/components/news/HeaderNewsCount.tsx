import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { CountBadge } from "@/components/ui/CountBadge";
import { db } from "@/db";
import { articles } from "@/db/schema";

export async function HeaderNewsCount() {
  const { userId } = await auth();
  if (!userId) return null;

  const [{ n }] = await db
    .select({ n: count() })
    .from(articles)
    .where(eq(articles.userId, userId));

  return <CountBadge count={n} />;
}
