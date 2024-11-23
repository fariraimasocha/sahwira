"use client";

import { signIn } from "next-auth/react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-gray-900">
          Sahwira AI
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Your intelligent sidekick for task management and voice transcription
        </p>
        <button
          onClick={() => signIn("google")}
          className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
