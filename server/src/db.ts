import { Express } from 'express';
import mongoose from 'mongoose';
import { MongoGenericDAO } from './models/dao/mongo-generic.dao.js';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export default async function startDB(app: Express) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const dbURI = isProduction ? process.env.mongo_uri_prod! : process.env.mongo_uri!;

    await mongoose.connect(dbURI);
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
