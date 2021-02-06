import mongoose from 'mongoose';

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

export default {
  openConnection: async (uri?: string): Promise<mongoose.Connection> => {
    const { MONGO_URI } = process.env;
    const dbUri = uri || MONGO_URI;

    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return mongoose.connection;
  },
  getConnection: (): mongoose.Connection => mongoose.connection,
  closeConnection: async (): Promise<mongoose.Connection> => {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    return mongoose.connection;
  },
};
