import Link from "next/link";
import { getCurrentUserAndRole } from "@/lib/auth-helpers";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const { user, role } = await getCurrentUserAndRole();
  return <header className="border-b bg-background"><nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
    <Link href="/" className="font-bold tracking-tight">Inkstone</Link>
    <div className="flex items-center gap-2 text-sm">
      <Button asChild variant="ghost" size="sm"><Link href="/">Blogs</Link></Button>
      {user ? <>
        <Button asChild variant="ghost" size="sm"><Link href="/dashboard">My Dashboard</Link></Button>
        {role === "admin" && <Button asChild variant="ghost" size="sm"><Link href="/admin">Admin Panel</Link></Button>}
        <span className="hidden rounded-full bg-muted px-3 py-1 text-xs sm:inline">{user.email}</span><LogoutButton />
      </> : <><Button asChild variant="outline" size="sm"><Link href="/auth/login">Sign in</Link></Button><Button asChild size="sm"><Link href="/auth/sign-up">Sign up</Link></Button></>}
    </div>
  </nav></header>;
}
