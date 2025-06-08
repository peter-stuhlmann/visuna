import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';

import connectToDatabase from '@/utils/connectToDatabase';
import {
  passwordRules,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '@/utils/validations';
import generateVerificationCode from '@/utils/generateVerificationCode';
import getVerificationEMailContent from '@/email-templates/get-verification-email-content';
import escapeRegExp from '@/utils/escapeRegExp';

export const POST = async (req: NextRequest) => {
  try {
    const { email, password, passwordConfirm } = await req.json();

    // Validate email, password, and password confirmation
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          message: passwordRules,
        },
        { status: 400 }
      );
    }

    if (!validatePasswordConfirmation(password, passwordConfirm)) {
      return NextResponse.json(
        { message: 'The passwords entered do not match.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const usersCollection = db.collection('users');

    // Check whether the e-mail address already exists in the users collection
    const normalizedEmail = email.toLowerCase();
    const existingUser = await usersCollection.findOne({
      email: { $regex: `^${escapeRegExp(normalizedEmail)}$`, $options: 'i' },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Diese E-Mail-Adresse ist bereits registriert.' },
        { status: 400 }
      );
    }

    // Check if the email is invited and retrieve the role and workspaces
    const user = await usersCollection.findOne({
      email: { $regex: `^${escapeRegExp(email)}$`, $options: 'i' }, // Case-insensitive check
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            'Diese E-Mail-Adresse ist nicht zur Registrierung berechtigt.',
        },
        { status: 400 }
      );
    }

    // const role = user.role || 'Redakteur'; // Fallback zu "Redakteur" falls keine Rolle gesetzt

    const hashedPassword = await hash(password, 10);

    // Generate a verification code
    const verificationCode = generateVerificationCode(20);
    const expiresAt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24h

    // Save new user with role and workspaces from user
    await usersCollection.insertOne({
      email: email,
      password: hashedPassword,
      passwordUpdatedAt: new Date(),
      verificationCode: verificationCode,
      verified: false,
      expiresAt: expiresAt,
      createdAt: new Date(),
      workspaces: user.workspaces, // Übernehme workspaces vom user
    });

    // Send verification email
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
      subject: 'Aktiviere Deinen Account',
      text: getVerificationEMailContent('text', verificationCode, email),
      html: getVerificationEMailContent('html', verificationCode, email),
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email to ' + email + ': ', error);
          reject(new Error('Failed to send email'));
        } else {
          console.log('Email sent to ' + email + ': ' + info.response);
          resolve(info);
        }
      });
    });

    return NextResponse.json(
      { message: 'Du hast Dich erfolgreich registriert.' },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Es ist ein Fehler aufgetreten.' },
      { status: 500 }
    );
  }
};
