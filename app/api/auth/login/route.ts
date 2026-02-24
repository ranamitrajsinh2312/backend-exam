import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    return Response.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return Response.json(
      { message: "Invalid password" },
      { status: 401 }
    );
  }

  const token = generateToken(user);

  return Response.json({ token });
}