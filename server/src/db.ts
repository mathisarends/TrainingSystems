import dotenv from 'dotenv';
import { Express } from 'express';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import { User } from './models/collections/user/user.js';
import { MongoGenericDAO } from './models/dao/mongo-generic.dao.js';
import trainingPlanManager from './service/trainingPlanManager.js';
import userManager from './service/userManager.js';

dotenv.config();

export default async function startDB(app: Express) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const dbURI = isProduction ? process.env.mongo_uri_prod! : process.env.mongo_uri!;

    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 50000
    });
    console.log('Database connected');

    const client = new MongoClient(dbURI);
    await client.connect();

    const db = client.db();
    const userDAO: MongoGenericDAO<User> = new MongoGenericDAO(db, 'user');

    app.locals.userDAO = userDAO;
    app.locals.friendshipDAO = new MongoGenericDAO(db, 'friendships');

    trainingPlanManager.setUserGenericDAO(userDAO);
    userManager.setUserGenericDAO(userDAO);
  } catch (err) {
    console.error('Error connecting to the database: ', err);
    process.exit(1);
  }
}
