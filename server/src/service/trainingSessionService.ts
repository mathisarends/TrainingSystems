import { NotFoundError } from '../errors/notFoundError.js';
import { TrainingSession } from '../models/collections/trainingSession.js';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao.js';

class TrainingSessionService {
  private trainingSessionDAO!: MongoGenericDAO<TrainingSession>;

  setDAO(trainingSessionDAO: MongoGenericDAO<TrainingSession>) {
    this.trainingSessionDAO = trainingSessionDAO;
  }

  async findByUserId(userId: string): Promise<TrainingSession[]> {
    const trainingSessions = await this.trainingSessionDAO.findAll({ userId });

    return trainingSessions;
  }

  async findByUserIdAndSessionId(userId: string, sessionId: string): Promise<TrainingSession> {
    const trainingSession = await this.trainingSessionDAO.findOne({ userId, id: sessionId });

    if (!trainingSession) {
      throw new NotFoundError(
        `Keine TrainingSession mit der ID ${sessionId} für diesen Benutzer mit der ID ${userId} gefunden.`
      );
    }

    return trainingSession;
  }

  async updateTrainingSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.findByUserIdAndSessionId(userId, sessionId);
    await this.trainingSessionDAO.update(session);
  }

  async createTrainingSession(sessionData: Omit<TrainingSession, 'id' | 'createdAt'>): Promise<TrainingSession> {
    const newSession: Omit<TrainingSession, 'id' | 'createdAt'> = {
      ...sessionData
    };

    return await this.trainingSessionDAO.create(newSession);
  }

  /**
   * Löscht eine TrainingSession basierend auf userId und sessionId.
   *
   * @param userId - ID des Benutzers
   * @param sessionId - ID der TrainingSession
   */
  async deleteTrainingSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.findByUserIdAndSessionId(userId, sessionId);

    if (!session) {
      throw new NotFoundError(
        `Keine TrainingSession mit der ID ${sessionId} für diesen Benutzer mit der ID ${userId} gefunden.`
      );
    }

    await this.trainingSessionDAO.delete(session.id);
  }
}

export default new TrainingSessionService();
