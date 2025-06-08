import { FC } from 'react';
import { NextResponse } from 'next/server';

import SetNewPasswordForm from '@/components/forms/set-new-password';
import connectToDatabase from '@/utils/connectToDatabase';
import { Heading } from '@/components/content-elements/default';
import Link from 'next/link';

type ResetPasswordPageProps = {
  searchParams?: Promise<{ code?: string }>;
};

const ResetPasswordPage: FC<ResetPasswordPageProps> = async ({
  searchParams,
}) => {
  const resolvedSearchParams = searchParams
    ? await searchParams
    : { code: undefined };
  const code = resolvedSearchParams.code || null;

  const codeStatus = await getCodeStatus(code);
  const { message } = await codeStatus.json();

  return (
    <>
      {code && codeStatus.status === 200 ? (
        <>
          <Heading element="h1" value="Vergib ein neues Passwort" />
          <SetNewPasswordForm code={code} />
        </>
      ) : (
        <div>{message}</div>
      )}
      <Link href="/login">Zur Login-Seite</Link>
    </>
  );
};

export default ResetPasswordPage;

const getCodeStatus = async (code: string | null) => {
  try {
    if (!code) {
      return NextResponse.json(
        { message: 'Dieser Link ist ungültig.' },
        { status: 404 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const usersCollection = db.collection('users');

    const existingPasswordResetCode = await usersCollection.findOne({
      'passwordReset.code': code,
      'passwordReset.expiresAt': { $gte: new Date() },
    });
    if (existingPasswordResetCode) {
      return NextResponse.json({ message: 'Code is valid.' }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: 'This link has expired or is invalid.' },
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
