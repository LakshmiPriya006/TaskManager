// =============================================================
// Users API Route - Returns list of all users for task assignment
// =============================================================

import { NextResponse } from "next/server";
import { User, connectDB } from "@/lib/db";

// =============================================================
// GET - Fetch all users (emails only, no passwords!)
// =============================================================
export async function GET() {
  try {
    await connectDB();
    
    // Find all users but only return _id and email (NOT password!)
    // The .select() method lets us pick which fields to return
    const users = await User.find({}).select("_id email").lean();
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
