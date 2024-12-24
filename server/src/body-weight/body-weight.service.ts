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
    // TODO: wieder einkommentieren das hier
    // const bodyWeightDocument = await this.bodyWeightModel.findOne({ userId });

    // return bodyWeightDocument ? bodyWeightDocument.weightEntries : [];

    return [
      { date: '2024-12-01', weight: 75.2 },
      { date: '2024-12-08', weight: 74.8 },
      { date: '2024-12-15', weight: 74.5 },
      { date: '2024-12-22', weight: 74.0 },
      { date: '2024-12-29', weight: 73.8 },
    ];
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
