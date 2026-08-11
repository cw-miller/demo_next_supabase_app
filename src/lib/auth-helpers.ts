import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function ensureProfile(id: string, email: string, fullName?: string | null) {
  await db.insert(profiles).values({ id, email, fullName: fullName ?? null }).onConflictDoNothing();
}

export async function getCurrentUserAndRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null, profile: null };
  await ensureProfile(user.id, user.email ?? "", (user.user_metadata.full_name as string | undefined) ?? null);
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  return { user, role: profile?.role ?? "user", profile: profile ?? null };
}
