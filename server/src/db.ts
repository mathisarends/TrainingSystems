import dotenv from 'dotenv';
import { Express } from 'express';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import { UserPushSubscription } from './models/collections/push-subscription.js';
import { TrainingSession } from './models/collections/trainingSession.js';
import { User } from './models/collections/user/user.js';
import { MongoGenericDAO } from './models/dao/mongo-generic.dao.js';
import pushSubscriptionService from './service/notifications/push-notification-service.js';
import trainingSessionService from './service/trainingSessionService.js';
import userManager from './service/userManager.js';

dotenv.config();

export default async function startDB(app: Express) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const dbURI = isProduction ? process.env.mongo_uri_prod : process.env.mongo_uri;

    if (!dbURI) {
      throw new Error('No valid database url');
    }

    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 50000
    });
    console.log('Database connected');

    const client = new MongoClient(dbURI);
    await client.connect();

    const db = client.db();
    const userDAO: MongoGenericDAO<User> = new MongoGenericDAO(db, 'user');
    const pushSubscriptionDAO: MongoGenericDAO<UserPushSubscription> = new MongoGenericDAO(db, 'userPushSubscriptions');
    const trainingSessionDAO: MongoGenericDAO<TrainingSession> = new MongoGenericDAO(db, 'trainingSessions');

    // TODO: kann das entfernt werden
    app.locals.userDAO = userDAO;
    app.locals.friendshipDAO = new MongoGenericDAO(db, 'friendships');

    // Kann man vereinheitlichen über eine basis klasse
    userManager.setUserGenericDAO(userDAO);
    pushSubscriptionService.setPushSubscriptionDAO(pushSubscriptionDAO);
    trainingSessionService.setDAO(trainingSessionDAO);
  } catch (err) {
    console.error('Error connecting to the database: ', err);
    process.exit(1);
  }
}
