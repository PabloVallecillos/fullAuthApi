const mongoose = require('mongoose');

const connectDB = async () => {
  const connection = await mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true, // Flag for using new URL string parser instead of current (deprecated) one
      useCreateIndex: true, // If true, this connection will use createIndex() instead of ensureIndex() for automatic index builds via Model.init().
      useFindAndModify: false, // Set to false to make findOneAndUpdate() and findOneAndRemove() use native findOneAndUpdate() rather than findAndModify().
      useUnifiedTopology: true, // Flag for using new Server Discovery and Monitoring engine instead of current (deprecated) one
      //https://mongoosejs.com/docs/deprecations.html
    })
    .then((db) => {
      console.log(`MongoDB Connected: ${db.connection.host}:${db.connection.port}`);
    })
    .catch((err) => console.error(err));
};

module.exports = connectDB;
