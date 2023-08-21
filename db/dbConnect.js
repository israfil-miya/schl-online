import mongoose from "mongoose";

const dbConnect = () => {
  try {
    if (mongoose.connections[0].readyState) {
      // console.log('Already connected.')
      return true
    }

    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // maxPoolSize: 10,
      dbName: "SCHL_PORTAL",
    });
    // console.log("Connected to Mongo Successfully!");
  } catch (error) {
  }
};


export default dbConnect;
