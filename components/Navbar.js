"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href={session ? "/dashboard" : "/"} className="flex px-4 md:px-24 items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
            Sahwira AI
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
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
              <Link href="/copilot">
                <Button variant="outline" size="sm">
                  Copilot
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

      {/* Mobile Navigation */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} border-t border-gray-200`}>
        <div className="flex flex-col space-y-2 px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {session ? (
            <>
              <Link href="/create" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Create Task
                </Button>
              </Link>
              <Link href="/tasks" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Tasks
                </Button>
              </Link>
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              <Link href="/copilot" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Copilot
                </Button>
              </Link>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600 block pb-2">
                  {session.user.name}
                </span>
                <Button
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}