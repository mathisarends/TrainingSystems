import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ExerciseModule } from 'src/exercise/exercise.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { FriendshipController } from './friendship.controller';
import { FriendshipGateway } from './friendship.gateway';
import { FriendshipService } from './friendship.service';
import { Friendship, FriendshipSchema } from './model/friendship.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendshipSchema },
    ]),
    UsersModule,
    ExerciseModule,
    AuthModule,
  ],
  controllers: [FriendshipController],
  providers: [FriendshipService, FriendshipGateway, UsersService],
})
export class FriendshipModule {}
