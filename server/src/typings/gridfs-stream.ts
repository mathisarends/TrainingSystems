declare module 'gridfs-stream' {
  import * as mongo from 'mongodb';
  import * as stream from 'stream';

  interface Grid {
    createWriteStream(options?: unknown): stream.Writable;
    createReadStream(options?: unknown): stream.Readable;
    remove(options: unknown, callback: (err: Error) => void): void;
    collection(name: string): void; // Add this line
  }

  function gridfs(conn: mongo.Db, mongo: mongo.MongoClient): Grid;

  export = gridfs;
}
