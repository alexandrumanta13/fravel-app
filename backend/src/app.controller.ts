import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  timestamp: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): ApiResponse {
    return {
      success: true,
      data: {
        message: 'Fravel Backend API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
