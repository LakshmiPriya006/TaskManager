import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
 
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    
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
