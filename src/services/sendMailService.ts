import nodemailer, { Transporter } from 'nodemailer';
import { resolve } from 'path';
import handlebars from 'handlebars';
import fs from 'fs';
import { stringify } from 'uuid';

class SendMailService {
    private client: Transporter;

    constructor() {
        nodemailer.createTestAccount().then(account => {
            const transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass
                }
            });
            this.client = transporter;
        });
    }

    async execute(to: string, subject: string, body: string) {
        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");
        const templateFileContent = fs.readFileSync(npsPath).toString("utf8");

        const mailTemplateParse = handlebars.compile(templateFileContent);

        const html = mailTemplateParse({name: to, title: subject, describe: body});

        const mesage = await this.client.sendMail({
            to,
            subject,
            html,
            from: "NPS <noreplay@nps.com.br>"
        });

        console.log('Message sent: %s', mesage.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(mesage));
    }
}

export default new SendMailService();