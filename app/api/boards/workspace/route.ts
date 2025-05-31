
import { NextResponse } from "next/server";
import { Board } from "../../../../lib/db";

export async function GET() {
  try {
    const boards = await Board.find({}).lean(); // get all boards from DB
    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
  }
}
