import mongoose from "mongoose"

export const connectToDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB: ", conn.connection.host);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);  //1 status code for failure, 0 means success
    }
}