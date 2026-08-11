import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { posts, profiles } from "@/db/schema";
import { Navbar } from "@/components/navbar";
export const instant = false;

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [result] = await db.select({ post: posts, author: profiles }).from(posts).innerJoin(profiles, eq(posts.authorId, profiles.id)).where(eq(posts.slug, slug)).limit(1);
  if (!result || !result.post.published) notFound();
  return <><Navbar /><article className="mx-auto max-w-3xl px-5 py-16"><p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(result.post.createdAt)} · {result.author.fullName || result.author.email}</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{result.post.title}</h1><div className="mt-10 whitespace-pre-wrap text-lg leading-8">{result.post.content}</div></article></>;
}
