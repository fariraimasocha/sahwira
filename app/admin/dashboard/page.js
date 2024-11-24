"use client";

import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Users, ListTodo, MessageSquare } from "lucide-react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { redirect } from "next/navigation";
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/');
    },
  });

  useEffect(() => {
    async function fetchStats() {
      if (!session?.user?.email) return;

      if (session.user.email !== 'fariraimasocha@gmail.com') {
        toast.error('Unauthorized access');
        redirect('/dashboard');
        return;
      }

      try {
        const response = await fetch(`/api/admin/stats?email=${session.user.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch admin stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [session]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton height={200} className="mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton height={150} />
          <Skeleton height={150} />
          <Skeleton height={150} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.users || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.tasks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Created tasks
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.conversations || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI conversations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4 border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Activity Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[350px] -mx-4 sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.dailyStats || []}>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Tasks
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].value}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Conversations
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[1].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="conversations"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Conversations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
