import { redirect } from "next/navigation";
import { createPost } from "@/app/actions/blog";
import { Navbar } from "@/components/navbar";
import { PostForm } from "@/components/post-form";
import { getCurrentUserAndRole } from "@/lib/auth-helpers";
export const dynamic = 'force-dynamic';
export default async function NewPost() { const { user } = await getCurrentUserAndRole(); if (!user) redirect("/auth/login"); return <><Navbar /><main className="mx-auto max-w-3xl px-5 py-10"><h1 className="mb-8 text-3xl font-bold">New post</h1><PostForm action={createPost} /></main></>; }
