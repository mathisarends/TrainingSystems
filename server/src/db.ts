import { Express } from 'express';
import mongoose from 'mongoose';

import { MongoGenericDAO } from './models/mongo-generic.dao.js';
import { MongoClient } from 'mongodb';

import dotenv from 'dotenv';
dotenv.config();

const mongoURI = process.env.mongo_uri!;

export default async function startDB(app: Express) {
  try {
    await mongoose.connect(mongoURI);
    console.log('Database connected');

    const client = new MongoClient(mongoURI);

    await client.connect();
    const db = client.db();

    app.locals.userDAO = new MongoGenericDAO(db, 'user');
  } catch (err) {
    console.error('Error connecting to the database: ', err);
    process.exit(1);
  }
}
