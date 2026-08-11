import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function ensureProfile(id: string, email: string, fullName?: string | null) {
  await db.insert(profiles).values({ id, email, fullName: fullName ?? null }).onConflictDoNothing();
}

/**
 * FAST PATH — for page renders and Server Components (Navbar, dashboard, admin, etc.)
 *
 * Uses getClaims() which reads the JWT cookie locally with NO network call (~1ms).
 * Role is still fetched from the profiles DB table (unavoidable — it lives there),
 * but that's ~50ms vs ~400ms for the getUser() Supabase round-trip.
 *
 * cache() deduplicates this per render tree — Navbar + page share one DB query.
 *
 * ⚠️  Do NOT use this in server actions that mutate data. Use getVerifiedUserAndRole() there.
 */
export const getCurrentUserAndRole = cache(async function getCurrentUserAndRole() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) return { user: null, role: null, profile: null };

  const userId = claims.sub as string;
  const userEmail = (claims.email as string) ?? "";
  const userMetadata = (claims.user_metadata as Record<string, unknown>) ?? {};

  let [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);

  // Only insert if the profile doesn't exist yet (first sign-in for this user).
  if (!profile) {
    await ensureProfile(userId, userEmail, (userMetadata.full_name as string | undefined) ?? null);
    [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  }

  return {
    user: { id: userId, email: userEmail, user_metadata: userMetadata },
    role: profile?.role ?? "user",
    profile: profile ?? null,
  };
});

/**
 * SECURE PATH — for server actions that write or mutate data.
 *
 * Uses getUser() which validates the JWT with Supabase's auth servers.
 * This guarantees the session is still active (not revoked, not expired).
 * Slower (~300–500ms) but only called on user-triggered mutations, not every render.
 *
 * Role is fetched from the profiles DB table (same as the fast path).
 */
export async function getVerifiedUserAndRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null, profile: null };
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  return { user, role: profile?.role ?? "user", profile: profile ?? null };
}
