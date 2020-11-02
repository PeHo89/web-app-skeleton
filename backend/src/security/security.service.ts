import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  createHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('base64');
  }

  verifyHash(plainData: string, hashedData: string): boolean {
    return this.createHash(plainData) === hashedData;
  }
}
