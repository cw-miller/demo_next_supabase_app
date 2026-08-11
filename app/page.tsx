import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, profiles } from "@/db/schema";
import { Navbar } from "@/components/navbar";
export const instant = false;

export default async function Home() {
  const publishedPosts = await db.select({ post: posts, author: profiles }).from(posts).innerJoin(profiles, eq(posts.authorId, profiles.id)).where(eq(posts.published, true)).orderBy(desc(posts.createdAt));
  return <><Navbar /><main className="mx-auto max-w-6xl px-5 py-14"><div className="mb-12 max-w-2xl"><p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">The public journal</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Ideas worth lingering over.</h1><p className="mt-4 text-muted-foreground">Fresh writing from the Inkstone community.</p></div>
    {publishedPosts.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{publishedPosts.map(({ post, author }) => <article key={post.id} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"><p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(post.createdAt)}</p><h2 className="mt-3 text-xl font-semibold"><Link className="hover:underline" href={`/blogs/${post.slug}`}>{post.title}</Link></h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.content}</p><p className="mt-5 text-sm font-medium">By {author.fullName || author.email}</p></article>)}</div> : <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">No published posts yet. Check back soon.</div>}
  </main></>;
}
