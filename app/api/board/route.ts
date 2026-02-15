import { NextResponse } from "next/server";
import { Board, connectDB } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth"; // your JWT extraction helper

export async function POST(req: Request) {
  try {
    await connectDB();
    const { title, backgroundColor } = await req.json();

    // Extract user ID from JWT token in Authorization header
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newBoard = new Board({ 
      title, 
      userId,
      backgroundColor: backgroundColor || "#0079BF",
      isStarred: false,
    });
    await newBoard.save();

    return NextResponse.json({ success: true, board: newBoard });
    
  } catch (error) {
    console.error("Board creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =============================================================
// DELETE - Remove a board and all its lists/tasks
// =============================================================
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { boardId } = await req.json();

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!boardId) {
      return NextResponse.json({ error: "Missing boardId" }, { status: 400 });
    }

    // Find the board and verify ownership
    const board = await Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    if (board.userId.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized to delete this board" }, { status: 403 });
    }

    // Import List and Task models for cascade delete
    const { List, Task } = await import("@/lib/db");

    // Delete all tasks belonging to this board
    await Task.deleteMany({ boardId });

    // Delete all lists belonging to this board
    await List.deleteMany({ boardId });

    // Delete the board
    await Board.findByIdAndDelete(boardId);

    return NextResponse.json({ success: true, message: "Board deleted successfully" });
  } catch (error) {
    console.error("Board deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
