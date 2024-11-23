"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Tasks from "@/components/Tasks";
import { redirect } from "next/navigation";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  useEffect(() => {
    async function fetchTasks() {
      if (!session?.user?.email) {
        setError("No user session found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/tasks?userId=${session.user.email}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [session]);

  const handleTaskUpdate = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-[64px] sm:pt-[58px]">
        <div className="max-w-[80.5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton height={40} className="mb-8" />
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton height={100} count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-[64px] sm:pt-[58px]">
        <div className="max-w-[80.5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[64px] sm:pt-[58px]">
      <div className="max-w-[80.5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {tasks.length} total {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <Tasks tasks={tasks} onTaskUpdate={handleTaskUpdate} />
        </div>
      </div>
    </div>
  );
}