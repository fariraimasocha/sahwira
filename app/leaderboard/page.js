'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Progress } from '@/components/ui/progress'

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        if (!response.ok) throw new Error('Failed to fetch leaderboard')
        const data = await response.json()
        setUsers(data)
        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-6 md:px-12 lg:px-24 py-6 md:py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary mx-auto" />
      </div>
    )
  }

  // Find current user's rank
  const currentUserRank = users.findIndex(user => user.email === session?.user?.email) + 1

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-24 py-6 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User's Current Rank */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Ranking</CardTitle>
            <CardDescription>Your current position on the leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {currentUserRank > 0 ? `#${currentUserRank}` : 'Not Ranked'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUserRank > 0 ? 'Keep up the great work!' : 'Complete tasks to get ranked'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Users */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Users with the most completed tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {users.slice(0, 3).map((user, index) => (
                <div
                  key={user._id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.completedTasks} tasks completed
                    </p>
                  </div>
                  <Progress 
                    value={((users[0].completedTasks - user.completedTasks) / users[0].completedTasks) * 100} 
                    className="w-20"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Full Leaderboard</CardTitle>
          <CardDescription>All ranked users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {users.map((user, index) => (
              <div
                key={user._id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  user.email === session?.user?.email ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}
              >
                <div className="w-8 text-center font-medium text-muted-foreground">
                  #{index + 1}
                </div>
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={user.image} />
                  <AvatarFallback>
                    {user.name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.completedTasks} tasks completed
                  </p>
                </div>
                <Progress 
                  value={((users[0].completedTasks - user.completedTasks) / users[0].completedTasks) * 100} 
                  className="w-24"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
