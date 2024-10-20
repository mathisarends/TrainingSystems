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

import { ExerciseService } from 'src/exercise/exercise.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly exerciseService: ExerciseService,
  ) {}

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
      exercises: this.exerciseService.getDefaultExercisesForUser(),
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
}
