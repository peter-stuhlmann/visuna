import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import generateVerificationCode from '@/utils/generateVerificationCode';
import connectToDatabase from '@/utils/connectToDatabase';
import getEMailContent from '@/email-templates/get-password-reset-email-content';
import escapeRegExp from '@/utils/escapeRegExp';

export const POST = async (req: Request) => {
  try {
    const { email } = await req.json();

    if (email === '') {
      return NextResponse.json(
        {
          message: 'Bitte gib Deine E-Mail-Adresse an.',
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const usersCollection = db.collection('users');

    // Check whether the e-mail address already exists regardless of upper and lower case letters
    const normalizedEmail = email.toLowerCase();
    const existingUser = await usersCollection.findOne({
      email: { $regex: `^${escapeRegExp(normalizedEmail)}$`, $options: 'i' },
    });

    if (!existingUser) {
      // return NextResponse.json(
      //   {
      //     message: 'Diese E-Mail-Adresse ist nicht registriert.',
      //   },
      //   { status: 400 }
      // );
      return NextResponse.json(
        {
          message:
            'Wenn ein Konto mit dieser E-Mail-Adresse existiert, senden wir Dir eine E-Mail zum Zurücksetzen Deines Passworts. Bitte beachte, dass der Link in der E-Mail nach 15 Minuten abläuft.',
        },
        { status: 200 }
      );
    }

    // Generate a password reset code
    const passwordResetCode = generateVerificationCode(20);
    const passwordResetExpiresAt = new Date(
      new Date().getTime() + 0.25 * 60 * 60 * 1000
    ); // 15min

    // Update user with reset code
    await usersCollection.updateOne(
      {
        email: { $regex: `^${escapeRegExp(normalizedEmail)}$`, $options: 'i' },
      },
      {
        $set: {
          passwordReset: {
            code: passwordResetCode,
            expiresAt: passwordResetExpiresAt,
          },
        },
      }
    );

    // password reset email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"VISUNA" <' + process.env.MAIL_USER + '>',
      to: email,
      subject: 'Passwort zurücksetzen',
      text: getEMailContent('text', passwordResetCode, email),
      html: getEMailContent('html', passwordResetCode, email),
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(
            'Error sending password reset email to ' + email + ': ',
            error
          );
          reject(new Error('Failed to send password reset email'));
        } else {
          console.log(
            'Passwort reset Email sent to ' + email + ': ' + info.response
          );
          resolve(info);
        }
      });
    });

    return NextResponse.json(
      {
        message:
          'Wenn ein Konto mit dieser E-Mail-Adresse existiert, senden wir Dir eine E-Mail zum Zurücksetzen Deines Passworts. Bitte beachte, dass der Link in der E-Mail nach 15 Minuten abläuft.',
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        message: 'Es ist ein Fehler aufgetreten.',
      },
      { status: 500 }
    );
  }
};
