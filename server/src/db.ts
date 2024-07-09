import { Express } from 'express';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

const mongoURI = process.env.mongo_uri!;

export default async function startDB(app: Express) {
  try {
    await mongoose.connect(mongoURI);
    console.log('Database connected');

    app.locals.db = mongoose.connection;
  } catch (err) {
    console.error('Error connecting to the database: ', err);
    process.exit(1);
  }
}
