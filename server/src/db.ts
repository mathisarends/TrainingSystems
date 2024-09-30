import dotenv from 'dotenv';
import { Express } from 'express';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import { MongoGenericDAO } from './models/dao/mongo-generic.dao.js';

dotenv.config();

export default async function startDB(app: Express) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const dbURI = isProduction ? process.env.mongo_uri_prod! : process.env.mongo_uri_2!;

    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 50000
    });
    console.log('Database connected');

    const client = new MongoClient(dbURI);
    await client.connect();

    const db = client.db();
    app.locals.userDAO = new MongoGenericDAO(db, 'user');
    app.locals.friendshipDAO = new MongoGenericDAO(db, 'friendships');
  } catch (err) {
    console.error('Error connecting to the database: ', err);
    process.exit(1);
  }
}
