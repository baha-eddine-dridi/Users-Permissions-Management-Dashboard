import { isDevelopment } from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  static async sendEmailStub(options: Pick<EmailOptions, 'to' | 'subject' | 'text'>): Promise<void> {
    if (isDevelopment()) {
      console.log('=== EMAIL STUB ===');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content: ${options.text}`);
      console.log('==================');
    }
  }

  static async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    await this.sendEmailStub({
      to: email,
      subject: 'Verification Email',
      text: `Hello ${firstName}, token: ${token}`,
    });
  }

  static async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    await this.sendEmailStub({
      to: email,
      subject: 'Password Reset',
      text: `Hello ${firstName}, reset token: ${token}`,
    });
  }
}
