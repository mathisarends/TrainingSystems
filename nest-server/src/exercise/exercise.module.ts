import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { ExerciseUpdateService } from './exercise-update.service';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [ExerciseController],
  providers: [ExerciseService, ExerciseUpdateService, UsersService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
