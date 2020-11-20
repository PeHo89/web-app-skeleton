import { Logger, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Options } from 'nodemailer/lib/smtp-connection';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private mailAccount = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_CONNECTION_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as Options);

  public async sendDoubleOptInMail(
    receiver: string,
    link: string,
  ): Promise<boolean> {
    try {
      await this.mailAccount.sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.APP_EMAIL}>`,
        to: receiver,
        subject: 'Please confirm your email',
        text: `Please click the following link to confirm your email: ${link}. We are happy to have you on board!`,
      });
      this.logger.log(
        `Successfully sent email for double opt in to '${receiver}'`,
      );
      return true;
    } catch (e) {
      this.logger.error(
        `Failed sending email for double opt in to '${receiver}': ${e.message}`,
      );
      return false;
    }
  }

  public async sendSetNewPasswordMail(
    receiver: string,
    link: string,
  ): Promise<boolean> {
    try {
      await this.mailAccount.sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.APP_EMAIL}>`,
        to: receiver,
        subject: 'Please set new password',
        text: `Please click the following link to set a new password: ${link}. We will see you again soon!`,
      });
      this.logger.log(
        `Successfully sent email for setting new password to '${receiver}'`,
      );
      return true;
    } catch (e) {
      this.logger.error(
        `Failed sending email for setting new password to '${receiver}': ${e.message}`,
      );
      return false;
    }
  }
}
