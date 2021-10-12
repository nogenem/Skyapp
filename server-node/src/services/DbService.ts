import mongoose from 'mongoose';

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

class DbService {
  static async openConnection(uri?: string): Promise<mongoose.Connection> {
    const { MONGO_URI } = process.env;
    const dbUri = uri || MONGO_URI;

    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return mongoose.connection;
  }

  static getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  static async closeConnection(): Promise<mongoose.Connection> {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    return mongoose.connection;
  }
}

export default DbService;
