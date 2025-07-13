import nodemailer, { Transporter } from 'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';
import path from 'path';
import { Options } from 'nodemailer/lib/mailer';

const isProduction = process.env.NODE_ENV === 'production';

interface IUser {
  email: string;
  name: string;
}

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export class Email {
  private to: string;
  private firstName: string;
  private url: string;
  private from: string;

  constructor(user: IUser, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Rithipong Leanghirunkun <${process.env.EMAIL_FROM}>`;
  }

  private newTransport(): Transporter {
    if (isProduction) {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY!
        }
      });
    }

    return nodemailer.createTransport({
      // mailtrap
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME!,
        pass: process.env.EMAIL_PASSWORD!
      }
    });
  }

  private async send(template: string, subject: string): Promise<void> {
    const templatePath = path.resolve(
      __dirname,
      '../../views/email',
      `${template}.pug`
    );
    console.log('tem', templatePath);
    // Render HTML from pug template
    // const html = pug.renderFile(templatePath, {
    //   firstName: this.firstName,
    //   url: this.url,
    //   subject
    // });
    let html;
    try {
      html = pug.renderFile(templatePath, {
        firstName: this.firstName,
        url: this.url,
        subject
      });
    } catch (err) {
      console.log('🔥 Error rendering pug:', err);
      throw err; // จะได้เห็น stack trace เต็ม
    }
    console.log('html', html);
    // Define email options
    const mailOptions: Options = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };
    console.log('mail', mailOptions);
    // Create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  public async sendWelcome(): Promise<void> {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  public async sendPasswordReset(): Promise<void> {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  public async sendBookingConfirmation(): Promise<void> {
    await this.send('bookingConfirmation', 'Your booking was successful!');
  }
}
