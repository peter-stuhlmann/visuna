// app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import { deleteUser } from '@/lib/users/users.service';
import { updateUser } from '@/lib/users/users.service';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const {userId} = await params;
    const user = await deleteUser(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/users/:id error:', error);
    return NextResponse.json(
      { message: 'Error deleting user.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const data = await req.json();
    const user = await updateUser(userId, data);

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (e: any) {
    if (e.message === 'VALIDATION_ERROR') {
      return NextResponse.json({ message: e.details }, { status: 400 });
    }

    console.error('PATCH /api/users/:id error:', e);
    return NextResponse.json(
      { message: 'Error updating user.' },
      { status: 500 }
    );
  }
}
