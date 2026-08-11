import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db"; import { posts } from "@/db/schema"; import { updatePost } from "@/app/actions/blog"; import { Navbar } from "@/components/navbar"; import { PostForm } from "@/components/post-form"; import { getCurrentUserAndRole } from "@/lib/auth-helpers";
export const dynamic = 'force-dynamic';
export default async function EditPost({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const { user, role } = await getCurrentUserAndRole(); if (!user) redirect("/auth/login"); const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1); if (!post) notFound(); if (role !== "admin" && post.authorId !== user.id) redirect("/dashboard"); return <><Navbar /><main className="mx-auto max-w-3xl px-5 py-10"><h1 className="mb-8 text-3xl font-bold">Edit post</h1><PostForm action={updatePost.bind(null, post.id)} post={post} /></main></>; }
