import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';

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

  async updateUser(id: string, updatedUserDto: UpdateUserDto) {
    const existingUser = await this.getUserById(id);

    Object.assign(existingUser, updatedUserDto);
    return await existingUser.save();
  }

  async createUser(createUserDto: CreateUserDto) {
    const { name, email, profilePicture, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      name,
      email,
      profilePicture,
      password: hashedPassword,
    });

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
