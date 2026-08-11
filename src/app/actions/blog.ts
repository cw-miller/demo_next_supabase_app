"use server";

import { and, eq, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { posts, profiles } from "@/db/schema";
import { getCurrentUserAndRole, getVerifiedUserAndRole } from "@/lib/auth-helpers";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function slugify(title: string) {
  return title.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "post";
}

async function uniqueSlug(title: string, omitId?: string) {
  const base = slugify(title);
  // Fetch all slugs matching `base` or `base-N` in a single query, then
  // resolve uniqueness in memory — no serial polling loop.
  const existing = await db
    .select({ id: posts.id, slug: posts.slug })
    .from(posts)
    .where(like(posts.slug, `${base}%`));
  const taken = new Set(existing.filter(r => r.id !== omitId).map(r => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

async function permitted(postId: string) {
  // Use the secure path — validates JWT with Supabase before any mutation.
  const auth = await getVerifiedUserAndRole();
  if (!auth.user) throw new Error("You must be signed in.");
  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) throw new Error("Post not found.");
  if (auth.role !== "admin" && post.authorId !== auth.user.id) throw new Error("You do not have permission to modify this post.");
  return { auth, post };
}

export async function createPost(formData: FormData) {
  // Use the secure path — this creates data, must verify the session.
  const { user } = await getVerifiedUserAndRole();
  if (!user) throw new Error("You must be signed in.");
  const title = value(formData, "title");
  const content = value(formData, "content");
  if (!title || !content) throw new Error("Title and content are required.");
  await db.insert(posts).values({ title, content, slug: await uniqueSlug(title), authorId: user.id, published: formData.get("published") === "on" });
  // Bust home page so the new post appears promptly; ISR handles subsequent freshness.
  revalidatePath("/"); revalidatePath("/dashboard"); revalidatePath("/admin");
  redirect("/dashboard");
}

export async function updatePost(postId: string, formData: FormData) {
  const { post } = await permitted(postId);
  const title = value(formData, "title");
  const content = value(formData, "content");
  if (!title || !content) throw new Error("Title and content are required.");
  const updated = { title, content, slug: await uniqueSlug(title, post.id), published: formData.get("published") === "on", updatedAt: new Date() };
  await db.update(posts).set(updated).where(eq(posts.id, post.id));
  // Invalidate only the affected blog slugs; home page ISR handles freshness.
  revalidatePath(`/blogs/${post.slug}`); revalidatePath(`/blogs/${updated.slug}`); revalidatePath("/dashboard"); revalidatePath("/admin");
  redirect("/dashboard");
}

export async function deletePost(postId: string) {
  const { post } = await permitted(postId);
  await db.delete(posts).where(eq(posts.id, post.id));
  revalidatePath(`/blogs/${post.slug}`); revalidatePath("/dashboard"); revalidatePath("/admin");
}

export async function togglePublishStatus(postId: string, publishedState: boolean) {
  const { post } = await permitted(postId);
  await db.update(posts).set({ published: publishedState, updatedAt: new Date() }).where(eq(posts.id, post.id));
  revalidatePath(`/blogs/${post.slug}`); revalidatePath("/dashboard"); revalidatePath("/admin");
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
  // Use the secure path — role changes are sensitive, must verify the session.
  const { role: currentRole } = await getVerifiedUserAndRole();
  if (currentRole !== "admin") throw new Error("Only admins can manage roles.");
  await db.update(profiles).set({ role }).where(and(eq(profiles.id, userId), eq(profiles.role, role === "admin" ? "user" : "admin")));
  revalidatePath("/admin");
}

export async function syncCurrentProfile() {
  const { user } = await getCurrentUserAndRole();
  if (!user) return;
  revalidatePath("/");
}
