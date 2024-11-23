"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Audio from "@/components/Create";

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Welcome, {session.user.name}</h1>
      <Audio />
    </div>
  );
}