"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { posts, profiles } from "@/db/schema";
import { getCurrentUserAndRole } from "@/lib/auth-helpers";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function slugify(title: string) {
  return title.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "post";
}

async function uniqueSlug(title: string, omitId?: string) {
  const base = slugify(title);
  let candidate = base;
  let number = 2;
  while (true) {
    const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, candidate)).limit(1);
    if (!existing || existing.id === omitId) return candidate;
    candidate = `${base}-${number++}`;
  }
}

async function permitted(postId: string) {
  const auth = await getCurrentUserAndRole();
  if (!auth.user) throw new Error("You must be signed in.");
  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) throw new Error("Post not found.");
  if (auth.role !== "admin" && post.authorId !== auth.user.id) throw new Error("You do not have permission to modify this post.");
  return { auth, post };
}

export async function createPost(formData: FormData) {
  const { user } = await getCurrentUserAndRole();
  if (!user) throw new Error("You must be signed in.");
  const title = value(formData, "title");
  const content = value(formData, "content");
  if (!title || !content) throw new Error("Title and content are required.");
  await db.insert(posts).values({ title, content, slug: await uniqueSlug(title), authorId: user.id, published: formData.get("published") === "on" });
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
  revalidatePath("/"); revalidatePath(`/blogs/${post.slug}`); revalidatePath(`/blogs/${updated.slug}`); revalidatePath("/dashboard"); revalidatePath("/admin");
  redirect("/dashboard");
}

export async function deletePost(postId: string) {
  const { post } = await permitted(postId);
  await db.delete(posts).where(eq(posts.id, post.id));
  revalidatePath("/"); revalidatePath(`/blogs/${post.slug}`); revalidatePath("/dashboard"); revalidatePath("/admin");
}

export async function togglePublishStatus(postId: string, publishedState: boolean) {
  const { post } = await permitted(postId);
  await db.update(posts).set({ published: publishedState, updatedAt: new Date() }).where(eq(posts.id, post.id));
  revalidatePath("/"); revalidatePath(`/blogs/${post.slug}`); revalidatePath("/dashboard"); revalidatePath("/admin");
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
  const { role: currentRole } = await getCurrentUserAndRole();
  if (currentRole !== "admin") throw new Error("Only admins can manage roles.");
  await db.update(profiles).set({ role }).where(and(eq(profiles.id, userId), eq(profiles.role, role === "admin" ? "user" : "admin")));
  revalidatePath("/admin");
}

export async function syncCurrentProfile() {
  const { user } = await getCurrentUserAndRole();
  if (!user) return;
  revalidatePath("/");
}
