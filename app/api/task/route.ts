import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Task } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function POST(req: NextRequest) {
  try {

    const { title, boardId, listId } = await req.json();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded?.id;

    if (!userId || !boardId || !listId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTask = await Task.create({ title, userId, boardId, listId });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// import mongoose from "mongoose";
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { Task } from "@/lib/db";

// const JWT_SECRET = process.env.JWT_SECRET || "";

// export async function POST(req: NextRequest) {
//   try {
//     const { title, boardId, listId } = await req.json();

//     const authHeader = req.headers.get("authorization");
//     if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
//     const userId = decoded?.id;

//     if (!userId || !boardId || !listId || !title) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     // 💥 Transform IDs into ObjectIds
//     const boardObjectId = mongoose.Types.ObjectId.isValid(boardId) ? new mongoose.Types.ObjectId(boardId) : null;
//     const listObjectId = mongoose.Types.ObjectId.isValid(listId) ? new mongoose.Types.ObjectId(listId) : null;

//     if (!boardObjectId || !listObjectId) {
//       return NextResponse.json({ error: "Invalid boardId or listId" }, { status: 400 });
//     }

//     const newTask = await Task.create({
//       title,
//       userId,
//       boardId: boardObjectId,
//       listId: listObjectId,
//     });

//     return NextResponse.json({ success: true, task: newTask }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating task:", error);
//     return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
//   }
// }

// import { NextResponse } from "next/server";
// import { Task } from "@/lib/db";
// import { getUserIdFromRequest } from "@/lib/auth";
// import mongoose from "mongoose";

// export async function POST(req: Request) {
//   try {
//     const { title, boardId, listId } = await req.json();

//     if (!title?.trim() || !boardId || !listId) {
//       return NextResponse.json(
//         { error: "Missing title, boardId, or listId" },
//         { status: 400 }
//       );
//     }

//     if (
//       !mongoose.Types.ObjectId.isValid(boardId) ||
//       !mongoose.Types.ObjectId.isValid(listId)
//     ) {
//       return NextResponse.json(
//         { error: "Invalid boardId or listId" },
//         { status: 400 }
//       );
//     }

//     const userId = await getUserIdFromRequest(req);
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const newTask = new Task({
//       title: title.trim(),
//       userId,
//       boardId,
//       listId,
//     });

//     await newTask.save();

//     return NextResponse.json({ success: true, task: newTask });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// import mongoose from "mongoose";
// import { NextResponse } from "next/server";
// import { List } from "@/lib/db";
// import { getUserIdFromRequest } from "@/lib/auth";

// export async function POST(req: Request) {
//   try {
//     const { title, boardId } = await req.json();

//     if (!title?.trim()) {
//       return NextResponse.json({ error: "Missing title" }, { status: 400 });
//     }

//     if (!mongoose.Types.ObjectId.isValid(boardId)) {
//       return NextResponse.json({ error: "Invalid boardId" }, { status: 400 });
//     }

//     const userId = await getUserIdFromRequest(req);
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const newList = new List({
//       title: title.trim(),
//       userId,
//       boardId: new mongoose.Types.ObjectId(boardId), // ✅ force ObjectId
//     });

//     await newList.save();

//     return NextResponse.json({ success: true, list: newList });
//   } catch (error) {
//     console.error("List creation error:", error); // log the real error
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
