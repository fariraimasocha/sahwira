'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Create from '@/components/Create';

export default function CreatePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/');
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <Create />;
}