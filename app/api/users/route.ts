// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/users/users.service';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await registerUser(data);

    return NextResponse.json(
      { message: 'Registrierung erfolgreich. Bitte prüfe deine E-Mails.' },
      { status: 201 }
    );
  } catch (e: any) {
    if (e.message === 'EMAIL_EXISTS') {
      return NextResponse.json(
        { message: 'Diese E-Mail-Adresse ist bereits registriert.' },
        { status: 400 }
      );
    }

    if (e.message === 'VALIDATION_ERROR') {
      return NextResponse.json({ message: e.details }, { status: 400 });
    }

    console.error('Register error:', e);
    return NextResponse.json(
      { message: 'Es ist ein Fehler aufgetreten.' },
      { status: 500 }
    );
  }
}
