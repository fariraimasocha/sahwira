"use client";

import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Plus, CheckCircle2, Clock, ListTodo, Target, Mic } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { redirect } from "next/navigation";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './calendar.css';
import { subDays, format } from 'date-fns';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/');
        },
    });

    const chartData = tasks.map((task) => ({
        date: new Date(task.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
        }),
        tasks: 1,
        completed: task.status === 'completed' ? 1 : 0,
    })).reduce((acc, curr) => {
        const existingDate = acc.find(item => item.date === curr.date);
        if (existingDate) {
            existingDate.tasks += curr.tasks;
            existingDate.completed += curr.completed;
        } else {
            acc.push(curr);
        }
        return acc;
    }, []);

    const tableData = tasks.map((task) => ({
        status: task.status,
        task: task.task,
        priority: task.priority,
        date: new Date(task.createdAt).toLocaleDateString(),
    }));

    // Prepare data for calendar heatmap
    const today = new Date();
    const startDate = subDays(today, 365);
    
    const calendarData = tasks.reduce((acc, task) => {
        const date = format(new Date(task.createdAt), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const heatmapValues = Object.entries(calendarData).map(([date, count]) => ({
        date,
        count,
    }));

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

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        incomplete: tasks.filter(t => t.status === 'pending').length,
        // Calculate daily progress
        dailyProgress: (() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todaysTasks = tasks.filter(task => {
                const taskDate = new Date(task.createdAt);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime();
            });

            const todayTotal = todaysTasks.length;
            const todayCompleted = todaysTasks.filter(t => t.status === 'completed').length;
            
            return {
                total: todayTotal,
                completed: todayCompleted,
                percentage: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0
            };
        })()
    };

    return (
        <div className="min-h-screen bg-background pt-[64px] sm:pt-[58px]">
            <div className="max-w-[80.5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Welcome back, {session?.user?.name || "User"}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Here&apos;s an overview of your productivity journey.
                        </p>
                    </div>
                    <Link href="/create">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Task
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {loading ? (
                        <>
                            {[1, 2, 3, 4].map((index) => (
                                <Card key={index} className="border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            <Skeleton width={100} />
                                        </CardTitle>
                                        <Skeleton circle width={16} height={16} />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl md:text-2xl font-bold text-foreground">
                                            <Skeleton width={80} />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            <Skeleton width={120} />
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    ) : (
                        <>
                            <Card className="border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                                    <ListTodo className="h-4 w-4 text-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl md:text-2xl font-bold text-foreground">
                                        {stats.total}
                                    </div>
                                    <p className="text-xs text-muted-foreground">All created tasks</p>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl md:text-2xl font-bold text-foreground">
                                        {stats.completed}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Tasks completed</p>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Incomplete</CardTitle>
                                    <Clock className="h-4 w-4 text-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl md:text-2xl font-bold text-foreground">
                                        {stats.incomplete}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Tasks pending completion</p>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Today's Progress</CardTitle>
                                    <Target className="h-4 w-4 text-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl md:text-2xl font-bold text-foreground">
                                        {stats.dailyProgress.percentage}%
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.dailyProgress.completed} of {stats.dailyProgress.total} tasks completed today
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Chart */}
                <Card className="mb-8 border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Task Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] sm:h-[300px] lg:h-[400px]">
                            {loading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Skeleton height="100%" width="100%" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
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
                                        />
                                        <Tooltip
                                            contentStyle={{ background: "#fff", border: "1px solid #ccc" }}
                                            labelStyle={{ color: "#333" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="tasks"
                                            stroke="#020817"
                                            strokeWidth={2}
                                            dot={false}
                                            name="Total Tasks"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="completed"
                                            stroke="#64748b"
                                            strokeWidth={2}
                                            dot={false}
                                            name="Completed"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar Heatmap */}
                <Card className="mb-8 border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Activity Calendar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full overflow-x-auto">
                            {loading ? (
                                <div className="h-[120px] w-full">
                                    <Skeleton height={120} />
                                </div>
                            ) : (
                                <div className="min-w-[750px]">
                                    <CalendarHeatmap
                                        startDate={startDate}
                                        endDate={today}
                                        values={heatmapValues}
                                        classForValue={(value) => {
                                            if (!value) {
                                                return 'color-empty';
                                            }
                                            return `color-scale-${Math.min(Math.floor(value.count / 2), 4)}`;
                                        }}
                                        titleForValue={(value) => {
                                            if (!value) {
                                                return "No tasks";
                                            }
                                            return `${value.count} tasks on ${value.date}`;
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Table */}
                <Card className="border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Recent Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="-mx-4 sm:mx-0 overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Status</TableHead>
                                            <TableHead>Task</TableHead>
                                            <TableHead className="hidden sm:table-cell">Priority</TableHead>
                                            <TableHead className="text-right">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <>
                                                {[1, 2, 3].map((index) => (
                                                    <TableRow key={index}>
                                                        <TableCell><Skeleton width={60} /></TableCell>
                                                        <TableCell><Skeleton width={120} /></TableCell>
                                                        <TableCell className="hidden sm:table-cell"><Skeleton width={40} /></TableCell>
                                                        <TableCell className="text-right"><Skeleton width={80} /></TableCell>
                                                    </TableRow>
                                                ))}
                                            </>
                                        ) : (
                                            tableData.map((task, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                            task.status === 'completed' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                                                            task.status === 'in_progress' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                                                            'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                        }`}>
                                                            {task.status.replace('_', ' ')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{task.task}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                            task.priority === 'High' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                                                            task.priority === 'Medium' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                                                            'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                        }`}>
                                                            {task.priority}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {task.date}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}