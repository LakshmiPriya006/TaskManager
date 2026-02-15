import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Board, connectDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();
 
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // =============================================================
    // Auto-create "My Personal Board" for new users
    // =============================================================
    await Board.create({
      title: "My Personal Board",
      userId: newUser._id,
      backgroundColor: "#0079BF",  // Default blue color
      isStarred: true,  // Star it by default so it's easy to find
    });
    
    // const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, {
    //   expiresIn: "1d",
    // });

    return NextResponse.json({ 
      message : "Signed Up successfully!!!"
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
