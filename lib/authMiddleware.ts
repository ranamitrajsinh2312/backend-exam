
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  
  (req as any).user = payload;

  return null; 
}
