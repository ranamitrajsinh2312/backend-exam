import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/lib/authMiddleware';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const errorResponse = authMiddleware(req);
    if (errorResponse) return errorResponse;

    const user = (req as any).user;
    const { id } = await params;
    const ticketId = parseInt(id);

    try {
        const { comment } = await req.json();

        if (!comment) {
            return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
        }

        const newComment = await prisma.ticketComment.create({
            data: {
                comment,
                ticketId,
                userId: user.id
            },
            include: {
                user: { select: { id: true, name: true } }
            }
        });

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const errorResponse = authMiddleware(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const ticketId = parseInt(id);

    try {
        const comments = await prisma.ticketComment.findMany({
            where: { ticketId },
            include: {
                user: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
