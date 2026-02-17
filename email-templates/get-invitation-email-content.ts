const getEMailContent = (
  type: 'html' | 'text',
  email: string,
  token: string,
  workspaceName: string,
  invitedByName: string
): string => {
  const baseUrl = process.env.NEXTAUTH_URL as string;
  const acceptUrl = `${baseUrl}/api/invitations/respond?token=${token}&action=accept`;
  const declineUrl = `${baseUrl}/api/invitations/respond?token=${token}&action=decline`;

  if (type === 'html') {
    return [
      `<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">`,
      createHeader(baseUrl),
      createContent(email, workspaceName, invitedByName),
      createButtons(acceptUrl, declineUrl),
      createFooter(),
      `</div>`,
    ].join('');
  } else if (type === 'text') {
    return `Hallo ${email},

${invitedByName} hat Dich zum Workspace „${workspaceName}" auf VISUNA eingeladen.

Einladung annehmen: ${acceptUrl}
Einladung ablehnen: ${declineUrl}

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
    <p style="margin-bottom: 40px;">
      <img src="${baseUrl}/img/logo.svg" width="200" height="70" alt="VISUNA" />
    </p>
  `;
};

const createContent = (
  email: string,
  workspaceName: string,
  invitedByName: string
): string => {
  return `
    <p style="margin-bottom: 10px;">
      <b style="font-size: 22px;">Hallo ${email},</b>
    </p>
    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px;">
      <b>${invitedByName}</b> hat Dich zum Workspace <b>„${workspaceName}"</b> auf VISUNA eingeladen.
    </p>
  `;
};

const createButtons = (acceptUrl: string, declineUrl: string): string => {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
      <tr>
        <td style="padding-right: 12px;">
          <a href="${acceptUrl}"
             style="display: inline-block; background-color: #0f0181; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            ✅ Einladung annehmen
          </a>
        </td>
        <td>
          <a href="${declineUrl}"
             style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; border: 1px solid #d1d5db;">
            Einladung ablehnen
          </a>
        </td>
      </tr>
    </table>
  `;
};

const createFooter = (): string => {
  return `
    <p style="margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 20px; color: #9ca3af; font-size: 13px;">
      Lorem Ipsum Company<br>
      Sample Street 1<br>
      12345 Sample City<br>
      Germany
    </p>
  `;
};
