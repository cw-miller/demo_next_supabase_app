import { Button } from "@/components/ui/button";

export function PostForm({ action, post }: { action: (formData: FormData) => void | Promise<void>; post?: { title: string; content: string; published: boolean } }) {
  return <form action={action} className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
    <div><label className="mb-2 block text-sm font-medium" htmlFor="title">Title</label><input className="w-full rounded-md border bg-background px-3 py-2" id="title" name="title" defaultValue={post?.title} required /></div>
    <div><label className="mb-2 block text-sm font-medium" htmlFor="content">Content</label><textarea className="min-h-72 w-full rounded-md border bg-background px-3 py-2" id="content" name="content" defaultValue={post?.content} required /></div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={post?.published} /> Publish this post</label>
    <Button type="submit">{post ? "Save changes" : "Create post"}</Button>
  </form>;
}
