// Email validation
export const validateEmail = (email: string): boolean => {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
};

// Password validation
export const validatePassword = (password: string): boolean => {
  return (
    password.length >= 8 && // at least 8 characaters
    /\d/.test(password) && // at least 1 number
    /[A-Z]/.test(password) && // at least 1 uppercase letter
    /[a-z]/.test(password) // at least 1 lowercase letter
  );
};

// Password confirmation validation
export const validatePasswordConfirmation = (
  password: string,
  passwordConfirm: string
): boolean => {
  return password === passwordConfirm;
};

export const passwordRules =
  'Das Passwort muss mindestens 8 Zeichen lang sein, mindestens 1 Zahl, mindestens 1 Großbuchstaben und mindestens 1 Kleinbuchstaben enthalten.';
