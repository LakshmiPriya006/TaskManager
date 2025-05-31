
import { NextResponse } from "next/server";
import { List } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { title, boardId } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
