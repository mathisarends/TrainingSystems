import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingLogNotification } from './model/training-log.model';

interface ExerciseSetCountByCategory {
  [category: string]: number;
}

@Injectable()
export class TrainingLogService {
  constructor(
    @InjectModel(TrainingLogNotification.name)
    private readonly trainingLogModel: Model<TrainingLogNotification>,
  ) {}

  async getAmoutOFTrainingLogNotificationsByUserId(userId: string) {
    return await this.trainingLogModel.find({ userId }).exec();
  }

  /**
   * Löscht alle Logs eines Benutzers.
   * @param userId Die ID des Benutzers
   * @returns Anzahl der gelöschten Logs
   */
  async deleteLogsByUser(userId: string) {
    const deleteResult = await this.trainingLogModel
      .deleteMany({ userId })
      .exec();

    return deleteResult.deletedCount;
  }

  /**
   * Erstellt und speichert eine neue TrainingLogNotification für einen Benutzer.
   * @param userId Die ID des Benutzers, für den die Log-Benachrichtigung erstellt wird.
   * @returns Die gespeicherte TrainingLogNotification
   */
  async createTrainingLogNotification(
    userId: string,
  ): Promise<TrainingLogNotification> {
    const newLog = new this.trainingLogModel({
      userId: userId,
    });

    return await newLog.save();
  }
}
