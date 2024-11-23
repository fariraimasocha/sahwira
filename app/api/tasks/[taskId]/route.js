import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Task from "@/models/Task";

export async function PATCH(request) {
  try {
    await connectDB();
    
    // Get taskId from the URL
    const taskId = request.url.split('/').pop();
    const updates = await request.json();

    // Find and update the task
    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
