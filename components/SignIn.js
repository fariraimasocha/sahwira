"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function SignIn() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Sahwira AI
          </h1>
          <p className="text-lg text-gray-600">
            Your AI-powered task assistant
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full bg-black hover:bg-gray-800 text-white py-6"
          >
            Continue with Google
          </Button>
          
          <p className="mt-4 text-sm text-center text-gray-500">
            Your personal AI assistant for task management
          </p>
        </div>
      </div>
    </div>
  )
}