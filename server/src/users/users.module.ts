import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseModule } from 'src/exercise/exercise.module';
import { ExerciseService } from 'src/exercise/exercise.service';
import { ProfileController } from 'src/profile/profile.controller';
import { ProfileService } from 'src/profile/profile.service';
import { UserSchema } from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ExerciseModule,
  ],
  controllers: [UsersController, ProfileController],
  providers: [UsersService, ProfileService, ExerciseService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
