import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BodyWeight } from './model/body-weight.model';
import { BodyWeightEntry } from './model/body-weight-entry.model';
import { BodyWeightEntryDto } from './dto/body-weight-entry.dto';

@Injectable()
export class BodyWeightService {
  constructor(@InjectModel(BodyWeight.name) private readonly bodyWeightModel: Model<BodyWeight>) {}

  async getBodyWeights(userId: string): Promise<BodyWeightEntry[]> {
    const bodyWeightDocument = await this.bodyWeightModel.findOne({ userId });

    return bodyWeightDocument ? bodyWeightDocument.weightEntries : [];
  }

  async addBodyWeight(userId: string, weightEntry: BodyWeightEntryDto): Promise<void> {
    const bodyWeightDocument = await this.bodyWeightModel.findOne({ userId });

    if (bodyWeightDocument) {
      bodyWeightDocument.weightEntries.push(weightEntry);
      await bodyWeightDocument.save();
    } else {
      const newDocument = new this.bodyWeightModel({
        userId,
        weightEntries: [weightEntry],
      });
      await newDocument.save();
    }
  }
}
