import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        //success connection
        const conn = await mongoose.connect(process.env.MONGO_URI);

        //console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.log("error:", err.message);
        process.exit(1);
    };
};