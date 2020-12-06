import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor() {
    webpush.setVapidDetails(
      `mailto:${process.env.APP_EMAIL}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
  }

  public async sendNotification(
    pushSubscription: any,
    payload: string,
  ): Promise<boolean> {
    try {
      const result = await webpush.sendNotification(pushSubscription, payload, {
        TTL: 60,
      });

      if (result.statusCode === 201) {
        this.logger.log(`Successfully sent notification`);
        return true;
      } else {
        this.logger.error(
          `Error on sending notification (status code: ${result.statusCode})`,
        );
      }
    } catch (error) {
      this.logger.error(`Error on sending notification: ${error}`);
    }
    return false;
  }
}
