import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/lib/authMiddleware';

const ticketInclude = {
    creator: {
        select: {
            id: true,
            name: true,
            email: true,
            role: { select: { id: true, name: true } },
            createdAt: true,
        },
    },
    assignee: {
        select: {
            id: true,
            name: true,
            email: true,
            role: { select: { id: true, name: true } },
            createdAt: true,
        },
    },
};

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const errorResponse = authMiddleware(req);
    if (errorResponse) return errorResponse;

    const user = (req as any).user;
    const { id } = await params;
    const ticketId = parseInt(id);

    if (user.role !== 'MANAGER' && user.role !== 'SUPPORT') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { status } = await req.json();

        if (!status) {
            return NextResponse.json({ message: 'status is required' }, { status: 400 });
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: { status },
            include: ticketInclude,
        });

        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
        }
        console.error('Error updating ticket status:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
