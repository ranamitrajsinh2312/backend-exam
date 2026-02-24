import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/lib/authMiddleware';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const errorResponse = authMiddleware(req);
    if (errorResponse) return errorResponse;

    const user = (req as any).user;
    const { id } = await params;
    const ticketId = parseInt(id);

    if (user.role !== 'MANAGER') {
        return NextResponse.json({ message: 'Unauthorized user check your rolw' }, { status: 403 });
    }

    try {
        await prisma.ticket.delete({
            where: { id: ticketId },
        });

        return new Response(null, { status: 204 });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
        }
        console.error('Error deleting ticket:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
