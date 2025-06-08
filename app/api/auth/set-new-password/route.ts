import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';

import {
  passwordRules,
  validatePassword,
  validatePasswordConfirmation,
} from '@/utils/validations';
import connectToDatabase from '@/utils/connectToDatabase';

export const POST = async (req: NextRequest) => {
  try {
    const { code, newPassword, newPasswordConfirm } = await req.json();

    const hashedPassword = await hash(newPassword, 10);

    if (!code) {
      return NextResponse.json(
        { message: 'This link is invalid.' },
        {
          status: 404,
        }
      );
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        {
          message: passwordRules,
        },
        { status: 400 }
      );
    }

    if (!validatePasswordConfirmation(newPassword, newPasswordConfirm)) {
      return NextResponse.json(
        {
          message: 'The passwords entered do not match.',
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME as string);

    const result = await db.collection('users').findOneAndUpdate(
      {
        'passwordReset.code': code,
        'passwordReset.expiresAt': { $gte: new Date() },
      },
      {
        $set: {
          password: hashedPassword,
          passwordUpdatedAt: new Date(),
        },
        $unset: {
          passwordReset: '',
        },
      },
      {
        returnDocument: 'after',
      }
    );

    if (result) {
      if (result.password === hashedPassword) {
        return NextResponse.json(
          { message: 'Your password has been updated.' },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: 'An unknown error has occurred.' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { message: 'The code has expired or is invalid.' },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { message: 'An unexpected error occurred.' },
        { status: 500 }
      );
    }
  }
};
