import nodemailer, { Transporter } from 'nodemailer';

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

class Email {
    private transporter: Transporter;
    private from: string;

    constructor() {
        this.from = 'Rithipong Leanghirunkun <hello@rithipong.com>';
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST as string,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    public async send(options: EmailOptions): Promise<void> {
        const mailOptions = {
            from: this.from,
            to: options.email,
            subject: options.subject,
            text: options.message
            // html: options.html
        };

        await this.transporter.sendMail(mailOptions);
    }
}

export default new Email();