import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🏦 TontineConnect API is running! 🚀';
  }
}
