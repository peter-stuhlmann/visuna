// lib/users/users.service.ts
import { deleteUserById, updateUserById } from './users.repo';
import { UpdateUserInput, UserDB } from './users.types';
// lib/users/users.service.ts
import { hash } from 'bcrypt';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  passwordRules,
} from '@/utils/validations';
import generateVerificationCode from '@/utils/generateVerificationCode';
import { findUserByEmail, createUser } from './users.repo';
import escapeRegExp from '@/utils/escapeRegExp';
import { sendVerificationMail } from '@/utils/mailer';

type RegisterInput = {
  email: string;
  password: string;
  passwordConfirm: string;
};

export async function deleteUser(userId: string): Promise<UserDB | null> {
  const user = await deleteUserById(userId);
  if (!user) return null;

  // Hier später z.B.:
  // - Logs schreiben
  // - Audit Trail
  // - Cleanup in anderen Collections

  return user;
}

export async function registerUser(input: RegisterInput) {
  const { email, password, passwordConfirm } = input;
  const normalizedEmail = email.toLowerCase();

  // Validation
  if (!validateEmail(normalizedEmail)) {
    const err = new Error('VALIDATION_ERROR');
    (err as any).details = 'Bitte gib eine gültige E-Mail-Adresse ein.';
    throw err;
  }

  if (!validatePassword(password)) {
    const err = new Error('VALIDATION_ERROR');
    (err as any).details = passwordRules;
    throw err;
  }

  if (!validatePasswordConfirmation(password, passwordConfirm)) {
    const err = new Error('VALIDATION_ERROR');
    (err as any).details = 'Die eingegebenen Passwörter stimmen nicht überein.';
    throw err;
  }

  // Already exists?
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('EMAIL_EXISTS');
  }

  // Create
  const hashedPassword = await hash(password, 10);
  const verificationCode = generateVerificationCode(20);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await createUser({
    email: normalizedEmail,
    password: hashedPassword,
    verificationCode,
    verified: false,
    expiresAt,
  });

  // Mail
  await sendVerificationMail(normalizedEmail, verificationCode);

  return user;
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const updateData: any = {};

  // Email ändern
  if (input.email) {
    if (!validateEmail(input.email)) {
      const err = new Error('VALIDATION_ERROR');
      (err as any).details = 'Ungültige E-Mail-Adresse.';
      throw err;
    }
    updateData.email = input.email.toLowerCase();
  }

  // Passwort ändern
  if (input.password) {
    if (!validatePassword(input.password)) {
      const err = new Error('VALIDATION_ERROR');
      (err as any).details = passwordRules;
      throw err;
    }
    updateData.password = await hash(input.password, 10);
    updateData.passwordUpdatedAt = new Date();
  }

  // Simple Felder
  if (input.name !== undefined) updateData.name = input.name;
  if (input.role !== undefined) updateData.role = input.role;
  if (input.verified !== undefined) updateData.verified = input.verified;

  if (Object.keys(updateData).length === 0) {
    return null;
  }

  return updateUserById(userId, updateData);
}
