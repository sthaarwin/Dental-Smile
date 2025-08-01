import { Controller, Post, Get } from '@nestjs/common';
import { DatabaseSeeder } from './database.seeder';

@Controller('seed')
export class SeederController {
  constructor(private readonly databaseSeeder: DatabaseSeeder) {}

  @Post()
  async seedDatabase() {
    try {
      const result = await this.databaseSeeder.seedDatabase();
      return {
        message: 'Database seeded successfully! 🎉',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Database seeding failed! ❌',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('status')
  async getSeedStatus() {
    return {
      message: 'Seeder is ready to use',
      instructions: {
        seed: 'POST /seed - Run database seeding',
        status: 'GET /seed/status - Check seeder status',
      },
      timestamp: new Date().toISOString(),
    };
  }
}