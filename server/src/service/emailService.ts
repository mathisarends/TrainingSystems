import { User } from '../models/collections/user/user.js';

export function createResetPasswordEmail(user: User, email: string, redirectUrl: string) {
  const username = user.username;
  const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333">
        <h3 style="color: #000"><b>Hallo ${username},</b></h3>
        <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>
        <p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
        <a href="${redirectUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #000; text-decoration: none; border-radius: 5px;">Passwort zurücksetzen</a>
        <br />
        <p>Diesen Link bitte nicht weitergeben.</p>
        <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
        <br />
        <p>Mit freundlichen Grüßen,<br />Ihr TYR-TS Team</p>
        <hr />
        <p style="font-size: 12px; color: #888">Wenn der obige Link nicht funktioniert, kopiere ihn bitte manuell in die Adressleiste deines Browsers:</p>
        <p style="font-size: 12px; color: #888">${redirectUrl}</p>
      </div>
    `;

  return {
    from: 'trainingSystems@no-reply.com',
    to: email,
    subject: 'Passwort zurücksetzen',
    html: emailContent
  };
}
