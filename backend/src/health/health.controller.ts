import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DataSource) {}

  @Get()
  async check() {
    let database = 'down';
    try {
      await this.db.query('SELECT 1');
      database = 'up';
    } catch {
      /* keep "down" */
    }
    return { status: 'ok', database, time: new Date().toISOString() };
  }
}
