"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { User, Trophy } from "lucide-react";
import { badges, calculateLevel, getEarnedBadges } from "@/config/badges";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    completedTasks: 0,
    points: 0,
    level: {
      current: 0,
      progress: 0,
      totalPoints: 0,
      nextLevelPoints: 100
    },
    earnedBadges: []
  });

  useEffect(() => {
    async function fetchTasks() {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/tasks?userId=${session.user.email}`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        
        const data = await response.json();
        const tasks = data.tasks || [];
        
        // Calculate completed tasks
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        
        // Calculate points (10 points per completed task)
        const points = completedTasks * 10;
        
        // Calculate level (every 100 points = 1 level)
        const currentLevel = Math.floor(points / 100);
        const nextLevelPoints = (currentLevel + 1) * 100;
        const progress = ((points % 100) / 100) * 100;

        // Calculate earned badges
        const earnedBadges = Object.values(badges).filter(badge => 
          completedTasks >= badge.requirement
        );

        setStats({
          completedTasks,
          points,
          level: {
            current: currentLevel,
            progress: Math.round(progress),
            totalPoints: points,
            nextLevelPoints
          },
          earnedBadges
        });
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }

    fetchTasks();
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto px-6 md:px-12 lg:px-24 py-6 md:py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Please sign in to view your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-24 py-6 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex items-start space-x-4">
              <div className="relative h-24 w-24">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-2 border-muted flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  Your Google profile picture is automatically synced.
                </p>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue={session.user.name}
                  readOnly
                  className="max-w-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue={session.user.email}
                  readOnly
                  className="max-w-md"
                />
              </div>
            </div>

            {/* Account Settings Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about your tasks and conversations.
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Language Preferences</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred language for the interface.
                    </p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card className="h-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <CardTitle>Achievements</CardTitle>
            </div>
            <CardDescription>Track your progress and earn badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Level and Points */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Level {stats.level.current}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.level.totalPoints} points total
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{stats.level.progress}%</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.level.nextLevelPoints - stats.level.totalPoints} points to next level
                  </p>
                </div>
              </div>
              <Progress value={stats.level.progress} className="h-2" />
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Completed Tasks</h4>
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Total Points</h4>
                <p className="text-2xl font-bold">{stats.points}</p>
              </div>
            </div>

            {/* Badges Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Earned Badges</h3>
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {Object.values(badges).map((badge) => {
                  const isEarned = stats.earnedBadges.some(earned => earned.id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        isEarned ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-muted'
                      }`}
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isEarned ? 'Achieved!' : `${badge.description} (${stats.completedTasks}/${badge.requirement})`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
