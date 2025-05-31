import { NextResponse } from "next/server";
import { Board } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth"; // your JWT extraction helper

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    // Extract user ID from JWT token in Authorization header
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newBoard = new Board({ title, userId });
    await newBoard.save();

    return NextResponse.json({ success: true, board: newBoard });
    
  } catch (error) {
    console.error("Board creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
