import { Db, Filter } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Entity } from '../collections/entity.js';
import { GenericDAO } from './generic.dao.js';

export class MongoGenericDAO<T extends Entity> implements GenericDAO<T> {
  constructor(
    private db: Db,
    private collection: string
  ) {}

  public async create(partEntity: Omit<T, keyof Entity>): Promise<T> {
    const entity = { ...partEntity, id: uuidv4(), createdAt: new Date().getTime() };
    await this.db.collection(this.collection).insertOne(entity);
    return entity as T;
  }

  public async findAll(entityFilter?: Partial<T>): Promise<T[]> {
    return this.db
      .collection<T>(this.collection)
      .find((entityFilter as Filter<T>) ?? {})
      .sort({ createdAt: -1 })
      .toArray() as Promise<T[]>;
  }

  public async findByCondition(condition: Filter<T>): Promise<T[]> {
    return this.db.collection<T>(this.collection).find(condition).sort({ createdAt: -1 }).toArray() as Promise<T[]>;
  }

  public async findOne(entityFilter: Partial<T>): Promise<T | null> {
    return this.db.collection<T>(this.collection).findOne(entityFilter as Filter<T>) as Promise<T | null>;
  }

  public async findOneWithCondition(condition: Filter<T>): Promise<T | null> {
    return this.db.collection<T>(this.collection).findOne(condition) as Promise<T | null>;
  }

  public async update(entity: Partial<T> & Pick<Entity, 'id'>): Promise<boolean> {
    const result = await this.db.collection(this.collection).updateOne({ id: entity.id }, { $set: entity });
    return !!result.modifiedCount;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.db.collection(this.collection).deleteOne({ id });
    return !!result.deletedCount;
  }

  public async deleteAll(entityFilter?: Partial<T>): Promise<number> {
    if (!entityFilter) {
      await this.db.collection(this.collection).drop();
      return -1;
    }
    const result = await this.db.collection(this.collection).deleteMany(entityFilter);
    return result.deletedCount || 0;
  }
}
