import mongoose from 'mongoose';

const connectDB = async (dbURL: string) => mongoose.connect(dbURL);
export default connectDB;