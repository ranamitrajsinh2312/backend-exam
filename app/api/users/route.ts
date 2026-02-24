
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/lib/authMiddleware';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const errorResponse = authMiddleware(req);
  if (errorResponse) return errorResponse;

  const user = (req as any).user;



  if (user.role !== 'MANAGER') {
    return NextResponse.json({ message: 'Forbidden: Manager access only' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        select: { name: true }
      },
    },
  });

  const flattenedUsers = users.map(u => ({
    ...u,
    role: u.role.name
  }));

  return NextResponse.json(flattenedUsers);
}

export async function POST(req: NextRequest) {
  const errorResponse = authMiddleware(req);

  if (errorResponse) {
    return errorResponse;
  }

  const user = (req as any).user;


  if (user.role !== 'MANAGER') {
    return NextResponse.json(
      { message: 'Forbidden: Manager access only' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    console.log("RAW BODY RECEIVED:", body);
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields (name, email, password, role)' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: {
          connect: { name: role }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      ...newUser,
      role: newUser.role.name
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
