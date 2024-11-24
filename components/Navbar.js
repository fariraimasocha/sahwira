"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, User, Settings, LogOut, Trophy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

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
        <div className="hidden md:flex items-center space-x-4 px-4 md:px-24">
          <Link
            href="/leaderboard"
            className="text-sm font-medium hover:text-primary flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
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
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        className="rounded-full"
                        fill
                        sizes="32px"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <Link href="/leaderboard" onClick={() => setIsOpen(false)}>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
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
                <div className="flex items-center gap-3 px-2 py-2">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-8 w-8 p-1 rounded-full border" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{session.user.name}</span>
                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
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