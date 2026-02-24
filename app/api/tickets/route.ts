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

export async function POST(req: NextRequest) {
    const errorResponse = authMiddleware(req);
    if (errorResponse) return errorResponse;

    const user = (req as any).user;

  
    if (user.role !== 'USER' && user.role !== 'MANAGER') {
        return NextResponse.json({ message: 'Unauthorized user check your role' }, { status: 403 });
    }

    try {
        const { title, description, priority } = await req.json();

        if (!title || !description) {
            return NextResponse.json({ message: 'Title and Description are required' }, { status: 400 });
        }

        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                createdBy: user.id,
            },
            include: ticketInclude,
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const errorResponse = authMiddleware(req);
    if (errorResponse) return errorResponse;

    const user = (req as any).user;
    let whereClause = {};

    if (user.role === 'SUPPORT') {
        whereClause = { assignedTo: user.id };
    } else if (user.role === 'USER') {
        whereClause = { createdBy: user.id };
    } else if (user.role !== 'MANAGER') {
        return NextResponse.json({ message: 'Unauthorized user check your role' }, { status: 403 });
    }

    try {
        const tickets = await prisma.ticket.findMany({
            where: whereClause,
            include: ticketInclude,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
