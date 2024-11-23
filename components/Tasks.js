"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, Circle, ChevronDown, ChevronUp,
  Snowflake, // Winter (Dec, Jan)
  Wind, // February
  Flower2, // March
  Cloud, // April
  Sun, // May
  Umbrella, // June
  Palmtree, // July
  Waves, // August
  LeafyGreen, // September
  Trees, // October
  CloudRain, // November
} from "lucide-react";
import { format } from "date-fns";
import toast, { Toaster } from 'react-hot-toast';

export default function Tasks({ tasks, onTaskUpdate }) {
  const [updating, setUpdating] = useState(null);
  const [expandedDates, setExpandedDates] = useState(new Set());

  const getMonthIcon = (month) => {
    const monthIcons = {
      0: Snowflake,    // January
      1: Wind,         // February
      2: Flower2,      // March
      3: Cloud,        // April
      4: Sun,          // May
      5: Umbrella,     // June
      6: Palmtree,     // July
      7: Waves,        // August
      8: LeafyGreen,   // September
      9: Trees,        // October
      10: CloudRain,   // November
      11: Snowflake,   // December
    };
    return monthIcons[month];
  };

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = format(new Date(task.createdAt), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  const handleToggleStatus = async (taskId, currentStatus) => {
    setUpdating(taskId);
    const loadingToast = toast.loading('Updating task status...');
    
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      onTaskUpdate(updatedTask);
      toast.success('Task status updated', { id: loadingToast });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error('Failed to update task status', { id: loadingToast });
    } finally {
      setUpdating(null);
    }
  };

  const toggleDate = (date) => {
    const newExpandedDates = new Set(expandedDates);
    const formattedDate = format(new Date(date), 'MMMM d, yyyy');
    
    if (newExpandedDates.has(date)) {
      newExpandedDates.delete(date);
      toast.success(`Collapsed tasks for ${formattedDate}`, {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#f3f4f6',
          color: '#374151',
        },
      });
    } else {
      newExpandedDates.add(date);
      toast.success(`Expanded tasks for ${formattedDate}`, {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#f3f4f6',
          color: '#374151',
        },
      });
    }
    setExpandedDates(newExpandedDates);
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="space-y-4">
        {Object.entries(tasksByDate)
          .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
          .map(([date, dateTasks]) => {
            const month = new Date(date).getMonth();
            const MonthIcon = getMonthIcon(month);
            return (
              <Card 
                key={date} 
                className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              >
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50/50"
                  onClick={() => toggleDate(date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <MonthIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {format(new Date(date), 'MMMM d, yyyy')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}
                        </p>
                      </div>
                    </div>
                    {expandedDates.has(date) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {expandedDates.has(date) && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {dateTasks.map((task) => (
                        <div 
                          key={task._id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-foreground truncate">
                              {task.task}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset 
                                ${task.priority === "High" 
                                  ? "bg-gray-50 text-gray-600 ring-gray-500/10" 
                                  : "bg-gray-50 text-gray-600 ring-gray-500/10"}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-4 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(task._id, task.status);
                            }}
                            disabled={updating === task._id}
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-gray-900" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-900" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
      </div>
    </>
  );
}
