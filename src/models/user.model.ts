
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: "string",
        trim: true,
        lowercase: true,
        required: [true, "must provide todo name"]
    },
    email: {
        type: "string",
        trim: true,
        lowercase: true,
        required: [true, "must provide todo email"]
    },
    password: {
        type: "string",
        trim: true,
        required: [true, "must provide todo password"]
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

export const UserModel = mongoose.model('User', UserSchema);
