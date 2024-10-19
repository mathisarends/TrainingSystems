import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async getUsers() {
    return await this.userModel.find().exec();
  }

  async getUserById(id: string) {
    try {
      return await this.userModel.findById(id);
    } catch (error) {
      throw new NotFoundException('Could not find user');
    }
  }

  async updateUser(user: User) {
    const existingUser = await this.getUserById(user.id);

    Object.assign(existingUser, user);
    return await existingUser.save();
  }

  async createUser(createUserDto: CreateUserDto) {
    const { name, email, profilePicture, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = new this.userModel({
      name,
      email,
      profilePicture,
      password,
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
