import connectToDatabase from '@/utils/connectToDatabase';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import getInvitationEMailContent from '@/email-templates/get-invitation-email-content';
import { ObjectId } from 'mongodb';
import { WorkspaceAccess } from '@/types';

export const POST = async (req: NextRequest) => {
  try {
    const { email, role, workspace } = await req.json(); // workspace und role zusätzlich auslesen

    // Prüfen, ob die E-Mail existiert und nicht leer ist
    if (!email || email.trim() === '') {
      return NextResponse.json(
        { message: 'E-Mail-Adresse erforderlich.' },
        { status: 400 }
      );
    }
    if (!workspace || workspace.trim() === '') {
      return NextResponse.json(
        { message: 'Workspace erforderlich.' },
        { status: 400 }
      );
    }
    // Prüfen, ob die Rolle gültig ist
    const validRoles = ['admin', 'redakteur'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        {
          message:
            'Ungültige Rolle. Es muss entweder "admin" oder "redakteur" sein.',
        },
        { status: 409 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const usersCollection = db.collection('users');
    const workspacesCollection = db.collection('workspaces');

    let userId: string;

    // Überprüfen, ob die E-Mail bereits in users existiert
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      userId = existingUser._id.toString();
      // Falls der Benutzer bereits eingeladen wurde, wird sein Eintrag aktualisiert:
      // Hier überschreiben wir den workspace-Wert (alternativ könnte man auch den Wert in ein Array pushen)
      await usersCollection.updateOne(
        { email },
        {
          $set: { workspaces: workspace },
        }
      );
    } else {
      // Neuer Eintrag – workspace wird als Array gespeichert
      const insertResult = await usersCollection.insertOne({
        email: email,
        verified: false, // Einladung wurde noch nicht verwendet
        currentWorkspaceId: workspace,
        createdAt: new Date(),
        workspaces: [workspace],
      });
      if (!insertResult.acknowledged) {
        throw new Error('Fehler beim Speichern des Eintrags in der Datenbank.');
      }
      userId = insertResult.insertedId.toString();
    }

    const workspaceDoc = await workspacesCollection.findOne({
      _id: new ObjectId(workspace as string),
    });

    // Prüfen ob access den User schon enthält
    const userAlreadyInWorkspace = workspaceDoc?.access?.some(
      (entry: WorkspaceAccess) => entry.userId.toString() === userId
    );

    if (userAlreadyInWorkspace) {
      return NextResponse.json(
        { message: 'Benutzer wurde für diesen Workspace bereits eingeladen.' },
        { status: 409 }
      );
    }

    // Falls nicht vorhanden, hinzufügen
    await workspacesCollection.updateOne(
      { _id: new ObjectId(workspace as string) },
      {
        $addToSet: { access: { userId, role } },
      }
    );

    // E-Mail-Versand
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"VISUNA" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Du wurdest eingeladen, VISUNA beizutreten',
      text: getInvitationEMailContent('text', email),
      html: getInvitationEMailContent('html', email),
    };

    try {
      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Error sending email to ' + email + ': ', error);
            await usersCollection.deleteOne({ email });
            reject(new Error('Failed to send email'));
          } else {
            console.log('Email sent to ' + email + ': ' + info.response);
            resolve(info);
          }
        });
      });
    } catch (emailError) {
      throw emailError; // Weiterwerfen, damit keine Erfolgsmeldung ausgegeben wird
    }

    // Aktualisierte Liste der eingeladenen Benutzer abrufen
    const updatedusers = await usersCollection.find({}).toArray();

    console.log(
      `Benutzer wurde eingeladen: ${email} als ${role} am ${new Date()}`
    );

    return NextResponse.json(
      {
        message: 'Benutzer erfolgreich eingeladen.',
        updatedUsers: updatedusers,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Fehler beim Einladen des Benutzers:', error);
    return NextResponse.json(
      { message: 'Fehler beim Einladen des Benutzers.' },
      { status: 500 }
    );
  }
};
