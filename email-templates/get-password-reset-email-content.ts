const getPasswordResetEMailContent = (
  type: 'html' | 'text',
  passwordResetCode: string,
  email: string
): string => {
  const baseUrl = process.env.NEXTAUTH_URL as string;

  if (type === 'html') {
    return [
      `<div style="max-width: 600px; margin: 0 auto; padding: 20px;">`,
      createHeader(baseUrl),
      createContent(email),
      createButton(baseUrl, passwordResetCode),
      createContentPart2(),
      createFooter(),
      `</div>`,
    ].join('');
  } else if (type === 'text') {
    return `Hallo ${email},

Du hast eine Passwortänderung angefordert. Ändere Dein Passwort, indem Du auf diesen Link klickst:
${baseUrl}/neues-passwort?code=${passwordResetCode}. 

Wenn Du Dein Passwort nicht ändern möchtest, ignoriere diese Nachricht einfach.

----------
Lorem Ipsum Company
Sample Street 1
12345 Sample City
Germany
    `;
  }

  return ``;
};

export default getPasswordResetEMailContent;

const createHeader = (baseUrl: string): string => {
  return `
    <p style="margin-bottom: 60px;">
      <img src="${baseUrl}/img/logo.svg" width="200" height="70" alt="Logo" />
    </p>
  `;
};

const createContent = (email: string): string => {
  return `
    <p style="margin-bottom: 20px;">
      <b style="font-size: 22px;">Hallo ${email},</b><br>
      Du hast eine Passwortänderung angefordert. Ändere Dein Passwort, indem Du auf diesen Link klickst:
    </p>
  `;
};

const createButton = (baseUrl: string, passwordResetCode: string): string => {
  return `
    <p style="margin-top: 30px; margin-bottom: 30px;">
      <a style="background-color: rgb(15, 1, 129); color: white; padding: 15px 30px; border-radius: 6px; text-decoration: none;" href="${baseUrl}/neues-passwort?code=${passwordResetCode}">
        Setze ein neues Passwort
      </a>
    </p>
  `;
};

const createContentPart2 = (): string => {
  return `
    <p style="margin-bottom: 30px;">
      Wenn Du Dein Passwort nicht ändern möchtest, ignoriere diese Nachricht einfach.
    </p>
  `;
};

const createFooter = (): string => {
  return `
    <p style="margin-top: 80px; border-top: 1px solid #ccc; padding-top: 20px; color: #666;">
      Lorem Ipsum Company<br>
      Sample Street 1<br>
      12345 Sample City<br>
      Germany
    </p>
  `;
};
