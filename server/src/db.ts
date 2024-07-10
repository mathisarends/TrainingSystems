import { Express } from 'express';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
import { MongoGenericDAO } from './models/mongo-generic.dao.js';
import { MongoClient, Db } from 'mongodb'; // Import MongoClient and Db from mongodb

dotenv.config();

const mongoURI = process.env.mongo_uri!;

export default async function startDB(app: Express) {
  try {
    // Connect to MongoDB using mongoose
    await mongoose.connect(mongoURI);
    console.log('Database connected');

    // Use MongoClient to get Db instance from mongoose connection
    const client = new MongoClient(mongoURI);

    await client.connect();
    const db = client.db();
    console.log('🚀 ~ startDB ~ db:', db);

    app.locals.userDAO = new MongoGenericDAO(db, 'user');
    console.log('🚀 ~ startDB ~ app.locals.userDAO:', app.locals.userDAO);
  } catch (err) {
    console.error('Error connecting to the database: ', err);
    process.exit(1);
  }
}
