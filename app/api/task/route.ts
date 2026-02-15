// =============================================================
// Task API Route - Handles creating, updating, and deleting tasks
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Task, connectDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "";

// Helper function to get user ID from the JWT token
function getUserIdFromToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded?.id || null;
  } catch {
    return null;
  }
}

// =============================================================
// POST - Create a new task
// =============================================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Get the task data from the request body
    const { title, boardId, listId, description, dueDate, labels, assignedTo } = await req.json();

    // Check if user is authenticated
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate required fields
    if (!title || !boardId || !listId) {
      return NextResponse.json({ error: "Missing required fields (title, boardId, listId)" }, { status: 400 });
    }

    // Create the new task with all fields
    const newTask = await Task.create({
      title,
      userId,
      boardId,
      listId,
      description: description || "",
      dueDate: dueDate || null,
      labels: labels || [],
      assignedTo: assignedTo || null,
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// =============================================================
// PATCH - Update an existing task (including moving to different list)
// =============================================================
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    
    // Get the task ID and update data from the request body
    const { taskId, title, description, dueDate, labels, assignedTo, listId } = await req.json();

    // Check if user is authenticated
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate that we have a task ID
    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    // Find the task first to make sure it exists
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Build the update object - only include fields that were provided
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (labels !== undefined) updateData.labels = labels;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    // This allows moving a task to a different list!
    if (listId !== undefined) updateData.listId = listId;

    // Update the task and return the new version
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true } // Return the updated document
    );

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// =============================================================
// DELETE - Remove a task
// =============================================================
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    // Get the task ID from the request body
    const { taskId } = await req.json();

    // Check if user is authenticated
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate that we have a task ID
    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    // Find and delete the task
    const deletedTask = await Task.findByIdAndDelete(taskId);
    
    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

// =============================================================
// GET - Fetch tasks (supports fetching assigned tasks)
// =============================================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Check if user is authenticated
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if we're fetching assigned tasks
    const { searchParams } = new URL(req.url);
    const fetchAssigned = searchParams.get("assigned") === "true";

    if (fetchAssigned) {
      // Need to import Board and List for populating board/list titles
      const { Board, List } = await import("@/lib/db");
      
      // Fetch tasks assigned to this user
      const tasks = await Task.find({ assignedTo: userId }).lean();
      
      // Enrich tasks with board and list titles
      const enrichedTasks = await Promise.all(
        tasks.map(async (task: any) => {
          const board = await Board.findById(task.boardId).select("title").lean();
          const list = await List.findById(task.listId).select("title").lean();
          return {
            ...task,
            boardTitle: board?.title || "Unknown Board",
            listTitle: list?.title || "Unknown List",
          };
        })
      );

      return NextResponse.json({ success: true, tasks: enrichedTasks });
    }

    // Default: return empty (can extend for other use cases)
    return NextResponse.json({ success: true, tasks: [] });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
