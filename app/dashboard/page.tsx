import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getCurrentUserAndRole } from "@/lib/auth-helpers";
import { deletePost, togglePublishStatus } from "@/app/actions/blog";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
export const instant = false;

export default async function Dashboard() {
  const { user } = await getCurrentUserAndRole(); if (!user) redirect("/auth/login");
  const mine = await db.select().from(posts).where(eq(posts.authorId, user.id)).orderBy(desc(posts.updatedAt));
  return <><Navbar /><main className="mx-auto max-w-5xl px-5 py-10"><div className="mb-8 flex items-center justify-between"><div><h1 className="text-3xl font-bold">My dashboard</h1><p className="mt-1 text-muted-foreground">Create and manage your writing.</p></div><Button asChild><Link href="/dashboard/new">Create new post</Link></Button></div>
  <div className="overflow-hidden rounded-xl border">{mine.length ? <table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr><th className="p-4">Post</th><th className="p-4">Status</th><th className="p-4">Updated</th><th className="p-4" /></tr></thead><tbody>{mine.map(post => <tr className="border-t" key={post.id}><td className="p-4 font-medium">{post.title}</td><td className="p-4">{post.published ? "Published" : "Draft"}</td><td className="p-4 text-muted-foreground">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(post.updatedAt)}</td><td className="p-4"><div className="flex justify-end gap-2"><form action={togglePublishStatus.bind(null, post.id, !post.published)}><Button variant="outline" size="sm">{post.published ? "Unpublish" : "Publish"}</Button></form><Button asChild variant="outline" size="sm"><Link href={`/dashboard/edit/${post.id}`}>Edit</Link></Button><form action={deletePost.bind(null, post.id)}><Button variant="destructive" size="sm">Delete</Button></form></div></td></tr>)}</tbody></table> : <div className="p-10 text-center text-muted-foreground">You have not written a post yet.</div>}</div></main></>;
}
