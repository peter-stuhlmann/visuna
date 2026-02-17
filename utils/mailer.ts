// utils/mailer.ts
import nodemailer from 'nodemailer';
import getVerificationEMailContent from '@/email-templates/get-verification-email-content';
import getInvitationEMailContent from '@/email-templates/get-invitation-email-content';

async function sendMail(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"VISUNA" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

export async function sendInvitationMail(
  email: string,
  token: string,
  workspaceName: string,
  invitedByName: string
) {
  await sendMail(
    email,
    `${invitedByName} hat Dich zum Workspace „${workspaceName}" auf VISUNA eingeladen`,
    getInvitationEMailContent('text', email, token, workspaceName, invitedByName),
    getInvitationEMailContent('html', email, token, workspaceName, invitedByName)
  );
}

export async function sendVerificationMail(email: string, code: string) {
  await sendMail(
    email,
    'Aktiviere Deinen Account',
    getVerificationEMailContent('text', code, email),
    getVerificationEMailContent('html', code, email)
  );
}
