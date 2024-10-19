import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserCreationMode } from './types/user-creation-mode.enum';
import { User } from './user.model';

import backExercises from 'src/exercise/ressources/backExercises';
import benchExercises from 'src/exercise/ressources/benchExercises';
import bicepsExercises from 'src/exercise/ressources/bicepsExercises';
import chestExercises from 'src/exercise/ressources/chestExercises';
import deadliftExercises from 'src/exercise/ressources/deadliftExercises';
import legExercises from 'src/exercise/ressources/legExercises';
import overheadpressExercises from 'src/exercise/ressources/overheadpressExercises';
import placeHolderExercises from 'src/exercise/ressources/placeholderExercises';
import shoulderExercises from 'src/exercise/ressources/shoulderExercises';
import squatExercises from 'src/exercise/ressources/squatExercises';
import tricepExercises from 'src/exercise/ressources/tricepsExercises';

import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async getUsers() {
    return await this.userModel.find().exec();
  }

  async getUserById(id: string): Promise<User> {
    try {
      return await this.userModel.findById(id);
    } catch (error) {
      throw new NotFoundException('Could not find user');
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      return await this.userModel.findOne({ email: email }).exec();
    } catch (error) {
      throw new NotFoundException('Could not find user');
    }
  }

  async updateUser(id: string, updatedUserDto: UpdateUserDto) {
    const existingUser = await this.getUserById(id);

    Object.assign(existingUser, updatedUserDto);
    return await existingUser.save();
  }

  async createUser(
    createUserDto: CreateUserDto,
    userCreationMode = UserCreationMode.REGULAR,
  ) {
    const { name, email, profilePicture, password } = createUserDto;

    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = new this.userModel({
      name,
      email,
      profilePicture,
      exercises: this.generateDefaultExercises(),
    });

    if (userCreationMode === UserCreationMode.REGULAR) {
      if (!password) {
        throw new BadRequestException(
          'Password is required for regular user creation',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      newUser.password = hashedPassword;
    }
    return await newUser.save();
  }

  async deleteUserById(id: string) {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
    return { deleted: true };
  }

  private generateDefaultExercises() {
    return {
      [ExerciseCategoryType.PLACEHOLDER]: placeHolderExercises,
      [ExerciseCategoryType.SQUAT]: squatExercises,
      [ExerciseCategoryType.BENCH]: benchExercises,
      [ExerciseCategoryType.DEADLIFT]: deadliftExercises,
      [ExerciseCategoryType.OVERHEADPRESS]: overheadpressExercises,
      [ExerciseCategoryType.CHEST]: chestExercises,
      [ExerciseCategoryType.BACK]: backExercises,
      [ExerciseCategoryType.SHOULDER]: shoulderExercises,
      [ExerciseCategoryType.TRICEPS]: tricepExercises,
      [ExerciseCategoryType.BICEPS]: bicepsExercises,
      [ExerciseCategoryType.LEGS]: legExercises,
    };
  }
}
