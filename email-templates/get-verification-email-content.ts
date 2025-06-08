const getEMailContent = (
  type: 'html' | 'text',
  verificationCode: string,
  email: string
): string => {
  const baseUrl = process.env.NEXTAUTH_URL as string;

  if (type === 'html') {
    return [
      `<div style="max-width: 600px; margin: 0 auto; padding: 20px;">`,
      createHeader(baseUrl),
      createContent(email),
      createButton(baseUrl, verificationCode),
      createFooter(),
      `</div>`,
    ].join('');
  } else if (type === 'text') {
    return `Hallo ${email},
bitte bestätige Deine Registrierung bei VISUNA innerhalb von 24 Stunden, indem Du auf diesen Link klickst:
${baseUrl}/registrierung-verifizieren?code=${verificationCode}

----------
Lorem Ipsum Company
Sample Street 1
12345 Sample City
Germany
    `;
  }

  return ``;
};

export default getEMailContent;

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
      bitte bestätige Deine Registrierung bei VISUNA innerhalb von 24 Stunden, indem Du auf diesen Link klickst:
    </p>
  `;
};

const createButton = (baseUrl: string, verificationCode: string): string => {
  return `
    <p style="margin-top: 30px; margin-bottom: 30px;">
      <a style="background-color: rgb(15, 1, 129); color: white; padding: 15px 30px; border-radius: 6px; text-decoration: none;" href="${baseUrl}/registrierung-verifizieren?code=${verificationCode}">
        Registrierung bestätigen
      </a>
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
