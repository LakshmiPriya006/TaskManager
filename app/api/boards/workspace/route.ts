
import { NextRequest, NextResponse } from "next/server";
import { Board, connectDB } from "../../../../lib/db";
import { getUserIdFromRequest } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get the current user's ID from token
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only fetch boards that belong to this user
    const boards = await Board.find({ userId }).lean();
    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
  }
}
