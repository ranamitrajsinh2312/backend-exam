import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/lib/authMiddleware';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const errorResponse = authMiddleware(req);
    if (errorResponse) return errorResponse;

    const user = (req as any).user;
    const { id } = await params;
    const commentId = parseInt(id);

    try {
        const { comment } = await req.json();

        // Check if comment exists and if user is authorized
        const existingComment = await prisma.ticketComment.findUnique({
            where: { id: commentId }
        });

        if (!existingComment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        if (existingComment.userId !== user.id && user.role !== 'MANAGER') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const updatedComment = await prisma.ticketComment.update({
            where: { id: commentId },
            data: { comment },
            include: {
                user: { select: { id: true, name: true } }
            }
        });

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const errorResponse = authMiddleware(req);
    if (errorResponse) return errorResponse;

    const user = (req as any).user;
    const { id } = await params;
    const commentId = parseInt(id);

    try {
        const existingComment = await prisma.ticketComment.findUnique({
            where: { id: commentId }
        });

        if (!existingComment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        if (existingComment.userId !== user.id && user.role !== 'MANAGER') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await prisma.ticketComment.delete({
            where: { id: commentId }
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
