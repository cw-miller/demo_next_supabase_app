import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { posts, profiles } from "@/db/schema";
import { getCurrentUserAndRole } from "@/lib/auth-helpers";
import { deletePost, togglePublishStatus, updateUserRole } from "@/app/actions/blog";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
export const instant = false;

export default async function AdminPage() {
  const { role } = await getCurrentUserAndRole(); if (role !== "admin") redirect("/dashboard");
  const allPosts = await db.select({ post: posts, author: profiles }).from(posts).innerJoin(profiles, eq(posts.authorId, profiles.id)).orderBy(desc(posts.updatedAt));
  const users = await db.select().from(profiles).orderBy(desc(profiles.createdAt));
  return <><Navbar /><main className="mx-auto max-w-6xl space-y-12 px-5 py-10"><section><h1 className="text-3xl font-bold">Admin panel</h1><p className="mt-1 text-muted-foreground">Manage every post and community role.</p></section>
  <section><h2 className="mb-4 text-xl font-semibold">All posts</h2><div className="overflow-hidden rounded-xl border"><table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr><th className="p-4">Post</th><th className="p-4">Author</th><th className="p-4">Status</th><th className="p-4" /></tr></thead><tbody>{allPosts.map(({ post, author }) => <tr className="border-t" key={post.id}><td className="p-4 font-medium">{post.title}</td><td className="p-4">{author.fullName || author.email}</td><td className="p-4">{post.published ? "Published" : "Draft"}</td><td className="p-4"><div className="flex justify-end gap-2"><form action={togglePublishStatus.bind(null, post.id, !post.published)}><Button variant="outline" size="sm">{post.published ? "Unpublish" : "Publish"}</Button></form><Button asChild variant="outline" size="sm"><Link href={`/dashboard/edit/${post.id}`}>Edit</Link></Button><form action={deletePost.bind(null, post.id)}><Button variant="destructive" size="sm">Delete</Button></form></div></td></tr>)}</tbody></table></div></section>
  <section><h2 className="mb-4 text-xl font-semibold">User roles</h2><div className="overflow-hidden rounded-xl border"><table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4" /></tr></thead><tbody>{users.map(person => <tr className="border-t" key={person.id}><td className="p-4">{person.fullName || person.email}</td><td className="p-4 capitalize">{person.role}</td><td className="p-4 text-right"><form action={updateUserRole.bind(null, person.id, person.role === "admin" ? "user" : "admin")}><Button variant="outline" size="sm">Make {person.role === "admin" ? "user" : "admin"}</Button></form></td></tr>)}</tbody></table></div></section>
  </main></>;
}
