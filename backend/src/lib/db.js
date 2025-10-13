import mongoose from "mongoose"
import {ENV} from "./env.js";

export const connectToDB = async () => {
    try {
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log("Connected to MongoDB: ", conn.connection.host);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);  //1 status code for failure, 0 means success
    }
}