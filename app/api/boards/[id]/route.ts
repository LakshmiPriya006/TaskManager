// import { NextResponse } from "next/server";
// import { Board } from "@/lib/db";

// export async function GET(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   const { id } = await context.params; // Await context to access `params`

//   const board = await Board.findById(id).select("title").lean();
//   if (!board) {
//     return NextResponse.json({ error: "Board not found" }, { status: 404 });
//   }
//   return NextResponse.json({ title: board.title });
// }


// import { NextResponse } from "next/server";
// import { Board } from "@/lib/db";

// export async function GET(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   const { id } = await context.params; // Await context to access `params`

//   const board = await Board.findById(id).select("title").lean();
//   if (!board) {
//     return NextResponse.json({ error: "Board not found" }, { status: 404 });
//   }
//   return NextResponse.json({ title: board.title });
// }

// import { NextResponse } from "next/server";
// import { Board } from "@/lib/db";
// import { z } from "zod";

// const boardSchema = z.object({
//   title: z.string(),
// });

// export async function GET(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   const { id } = await context.params; // Await context to access `params`

//   try {
//     // Explicitly find the board
//     const rawBoard = await Board.findOne({ _id: id })
//   .populate({
//     path: "lists",
//     populate: { path: "tasks" },
//   })
//   .lean();


//     // Validate the result
//     const parsed = boardSchema.safeParse(rawBoard);
//     if (!parsed.success) {
//       return NextResponse.json(
//         { error: "Board not found or schema mismatch" },
//         { status: 404 }
//       );
//     }

//     // Let’s push further: imagine this endpoint also returns dynamic insights
//     const usageInsights = {
//       lastAccessed: new Date().toISOString(),
//       mood: "inspired",
//     };

//     // Final reimagined response
//     return NextResponse.json({
//       ...parsed.data,
//       usageInsights,
//       message: "Here’s your board title, reimagined with insights 🚀",
//     });
//   } catch (error) {
//     console.error("Error fetching board:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


// import { NextResponse } from "next/server";
// import { Board } from "@/lib/db";

// export async function GET(request: Request, context: { params: { id: string } }) {
//   const { id } = context.params;

//   try {
//     // Fetch board with lists and tasks populated
//     const board = await Board.findOne({ _id: id })
//       .populate({
//         path: "lists",
//         populate: { path: "tasks" },
//       })
//       .lean();

//     if (!board) {
//       return NextResponse.json({ error: "Board not found" }, { status: 404 });
//     }

//     // Optional: add dynamic insights or enrich response here
//     const usageInsights = {
//       lastAccessed: new Date().toISOString(),
//       mood: "inspired",
//     };

//     return NextResponse.json({
//       ...board,
//       usageInsights,
//       message: "Full board data with lists and tasks delivered 🚀",
//     });
//   } catch (error) {
//     console.error("Error fetching board:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { Board, connectDB } from "@/lib/db";

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    await connectDB();
    const board = await Board.findById(id)
  .populate({
    path: "lists",
    populate: { path: "tasks" },
    // strictPopulate: false,  // <<< disable strict populate here
  })
  .lean();


    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =============================================================
// PATCH - Update board properties (star, background color, title)
// =============================================================
export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    await connectDB();
    
    const { isStarred, backgroundColor, title } = await request.json();

    // Build update object with only provided fields
    const updateData: any = {};
    if (isStarred !== undefined) updateData.isStarred = isStarred;
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
    if (title !== undefined) updateData.title = title;

    const updatedBoard = await Board.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedBoard) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, board: updatedBoard });
  } catch (error) {
    console.error("Error updating board:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
