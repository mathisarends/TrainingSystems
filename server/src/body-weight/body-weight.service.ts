import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BodyWeight } from './model/body-weight.model';
import { BodyWeightEntry } from './model/body-weight-entry.model';
import { BodyWeightEntryDto } from './dto/body-weight-entry.dto';
import { UpdateWeightGoalDto } from './dto/body-weight-configuration.dto';

@Injectable()
export class BodyWeightService {
  constructor(@InjectModel(BodyWeight.name) private readonly bodyWeightModel: Model<BodyWeight>) {}

  async getBodyWeights(userId: string): Promise<BodyWeightEntry[]> {
    const bodyWeightDocument = await this.bodyWeightModel.findOne({ userId });

    return bodyWeightDocument ? bodyWeightDocument.weightEntries : [];
  }

  async addBodyWeight(userId: string, weightEntry: BodyWeightEntryDto): Promise<void> {
    const bodyWeightDocument = await this.bodyWeightModel.findOne({ userId });

    const newEntryDate = new Date(weightEntry.date).toISOString().split('T')[0];

    if (bodyWeightDocument) {
      const existingEntry = bodyWeightDocument.weightEntries.find(
        (entry: BodyWeightEntryDto) => new Date(entry.date).toISOString().split('T')[0] === newEntryDate,
      );

      if (existingEntry) {
        existingEntry.weight = weightEntry.weight;

        bodyWeightDocument.markModified('weightEntries');
      } else {
        bodyWeightDocument.weightEntries.unshift(weightEntry);
      }

      await bodyWeightDocument.save();
    } else {
      const newDocument = new this.bodyWeightModel({
        userId,
        weightEntries: [weightEntry],
      });
      await newDocument.save();
    }
  }

  async getBodyWeightConfiguration(userId: string) {
    const bodyWeightDocument = await this.bodyWeightModel.findOne({ userId });

    if (bodyWeightDocument) {
      return {
        weightGoal: bodyWeightDocument.weightGoal,
        weightGoalRate: bodyWeightDocument.weightGoalRate,
      };
    }

    return {
      weightGoal: 'MAINTAIN',
      weightGoalRate: 0,
    };
  }

  async saveBodyWeightConfiguration(userId: string, updateWeightGoalDto: UpdateWeightGoalDto) {
    const bodyWeightDocument = await this.bodyWeightModel.findOne({ userId });

    if (!bodyWeightDocument) {
      const newDocument = new this.bodyWeightModel({
        userId,
        weightEntries: [],
        weightGoal: updateWeightGoalDto.weightGoal,
        weightGoalRate: updateWeightGoalDto.weightGoalRate,
      });
      return await newDocument.save();
    }

    bodyWeightDocument.weightGoal = updateWeightGoalDto.weightGoal;
    bodyWeightDocument.weightGoalRate = updateWeightGoalDto.weightGoalRate;

    return await bodyWeightDocument.save();
  }
}
