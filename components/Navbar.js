"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r px-24 from-gray-800 to-gray-900 bg-clip-text text-transparent">
            Sahwira AI
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/create">
                <Button variant="outline" size="sm">
                  Create Task
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" size="sm">
                  Tasks
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <span className="text-sm text-gray-600">
                {session.user.name}
              </span>
              <Button
                size="sm"
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}