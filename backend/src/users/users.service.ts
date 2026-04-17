import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(email: string, password: string, name: string, role?: string): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, passwordHash, name, role });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash').exec();
  }

  async seedAdmin(): Promise<void> {
    const existing = await this.findByEmail('admin@crm.local');
    if (!existing) {
      await this.create('admin@crm.local', 'admin123', 'Admin User', 'Admin');
    }
  }
}
