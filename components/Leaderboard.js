'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Trophy, Activity } from 'lucide-react'

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        if (!response.ok) throw new Error('Failed to fetch leaderboard')
        const data = await response.json()
        setTopUsers(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching top users:', error)
        setLoading(false)
      }
    }

    fetchTopUsers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-xl rounded-xl">
        <CardHeader className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900">Leaderboard</h2>
            </div>
            <Activity className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Top performers showcasing excellence in task completion</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {topUsers.map((user, index) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 ease-in-out"
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-8 font-bold">
                    {index + 1 <= 3 ? (
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="text-xl text-gray-400">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-gray-100">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700">
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{user.name || user.email}</div>
                    <div className="text-sm text-gray-500 hidden md:block">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-2 rounded-full shadow-sm">
                  <span className="font-bold text-xl text-gray-900">{user.completedTasks}</span>
                  <span className="text-gray-500">tasks</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}