import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    if (!token || token === "null" || token === "undefined") return null;
    
    // Basic JWT format check (three parts separated by dots)
    if (token.split(".").length !== 3) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    return decoded?.id ?? null;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
