// =============================================================
// List API Route - Handles creating, updating, and deleting lists
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { List, Task, connectDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "";

// Helper function to get user ID from the JWT token
function getUserIdFromToken(req: Request): string | null {
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
// POST - Create a new list
// =============================================================
export async function POST(req: Request) {
  try {
    await connectDB();
    
    // Get the list data from the request body
    const { title, boardId } = await req.json();

    // Validate title
    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    // Check if user is authenticated
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create the new list
    const newList = new List({
      title: title.trim(),
      userId,
      boardId,
    });

    await newList.save();
    return NextResponse.json({ success: true, list: newList });
  } catch (error) {
    console.error("List creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// =============================================================
// PATCH - Update an existing list (rename it)
// =============================================================
export async function PATCH(req: Request) {
  try {
    await connectDB();
    
    // Get the list ID and new title from the request body
    const { listId, title } = await req.json();

    // Check if user is authenticated
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate that we have a list ID
    if (!listId) {
      return NextResponse.json({ error: "Missing listId" }, { status: 400 });
    }

    // Find and update the list
    const updatedList = await List.findByIdAndUpdate(
      listId,
      { title: title.trim() },
      { new: true } // Return the updated document
    );

    if (!updatedList) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, list: updatedList });
  } catch (error) {
    console.error("List update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// =============================================================
// DELETE - Remove a list and all its tasks
// =============================================================
export async function DELETE(req: Request) {
  try {
    await connectDB();
    
    // Get the list ID from the request body
    const { listId } = await req.json();

    // Check if user is authenticated
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate that we have a list ID
    if (!listId) {
      return NextResponse.json({ error: "Missing listId" }, { status: 400 });
    }

    // First, delete all tasks that belong to this list
    await Task.deleteMany({ listId });

    // Then delete the list itself
    const deletedList = await List.findByIdAndDelete(listId);

    if (!deletedList) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "List and its tasks deleted successfully" });
  } catch (error) {
    console.error("List deletion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
