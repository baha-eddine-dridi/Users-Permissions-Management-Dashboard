import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Service d'envoi d'emails
 */
export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialise le transporteur nodemailer
   */
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true pour le port 465, false pour les autres
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
    return this.transporter;
  }

  /**
   * Envoie un email générique
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const transporter = this.getTransporter();
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      });
      
      console.log(`✅ Email envoyé avec succès à: ${options.to}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  /**
   * Envoie un email de vérification avec code à 6 chiffres
   */
  static async sendVerificationEmail(
    email: string,
    code: string,
    firstName: string
  ): Promise<void> {
    const subject = 'Code de vérification - Votre compte';
    const text = `
Bonjour ${firstName},

Merci de vous être inscrit ! Voici votre code de vérification :

${code}

Ce code expire dans 15 minutes.

Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.

Cordialement,
L'équipe
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background-color: #f9fafb; text-align: center; }
    .code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; padding: 20px; background: white; border: 2px dashed #4F46E5; border-radius: 10px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Code de Vérification</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>Merci de vous être inscrit ! Voici votre code de vérification :</p>
      <div class="code">${code}</div>
      <p><strong>⏱️ Ce code expire dans 15 minutes.</strong></p>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Envoie un email de réinitialisation de mot de passe avec code à 6 chiffres
   */
  static async sendPasswordResetEmail(
    email: string,
    code: string,
    firstName: string
  ): Promise<void> {
    const subject = 'Code de réinitialisation - Mot de passe';
    const text = `
Bonjour ${firstName},

Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de réinitialisation :

${code}

Ce code expire dans 15 minutes.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.

Cordialement,
L'équipe
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background-color: #f9fafb; text-align: center; }
    .code { font-size: 32px; font-weight: bold; color: #DC2626; letter-spacing: 8px; padding: 20px; background: white; border: 2px dashed #DC2626; border-radius: 10px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Réinitialisation de mot de passe</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Voici votre code :</p>
      <div class="code">${code}</div>
      <p><strong>⏱️ Ce code expire dans 15 minutes.</strong></p>
      <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Stub pour les emails en mode développement (affiche dans la console)
   */
  static async sendEmailStub(options: EmailOptions): Promise<void> {
    console.log('\n📧 ===== EMAIL STUB (MODE DÉVELOPPEMENT) =====');
    console.log(`📬 À: ${options.to}`);
    console.log(`📝 Sujet: ${options.subject}`);
    console.log(`📄 Contenu:\n${options.text}`);
    console.log('============================================\n');
  }
}
