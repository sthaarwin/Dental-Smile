import { Module } from '@nestjs/common';
import { DentistsController } from './dentists.controller';
import { DentistsService } from './dentists.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [DentistsController],
  providers: [DentistsService],
  exports: [DentistsService]
})
export class DentistsModule {}