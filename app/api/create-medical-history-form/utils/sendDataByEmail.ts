import nodemailer from 'nodemailer';
import formatUserKey from '@/utils/formatClientKey';

export type GenericForm = {
  [key: string]: string | number | boolean | undefined;
  clientId: string;
  createdAt: string;
  signature?: string;
};

export const sendDataByEmail = async (insertedDocument: GenericForm) => {
  try {
    // Erstelle einen Transporter für Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Formatierte Felder und Werte für die E-Mail
    const formDataEntries = Object.entries(insertedDocument)
      .filter(([key]) => key !== '_id')
      .map(([key, value]) => {
        const field = formatUserKey(key);
        if (
          key === 'signature' &&
          typeof value === 'string' &&
          value.startsWith('data:image')
        ) {
          return `<p><strong>${field.label}:</strong><br><img src="${value}" alt="Signature" /></p>`;
        } else {
          return `<p><strong>${field.label}:</strong> ${value}</p>`;
        }
      })
      .join('');

    // E-Mail-Optionen
    const mailOptions = {
      from: `"Anamnesebogen" <${process.env.MAIL_USER}>`,
      to: `${process.env.MAIL_RECEIVER}`,
      subject: `Anamnesebogen: ${insertedDocument.name}`,
      text: `Anamnesebogen: ${formDataEntries}.`,
      html: `<h2>Anamnesebogen</h2>${formDataEntries}`,
    };

    // Sende die E-Mail
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
