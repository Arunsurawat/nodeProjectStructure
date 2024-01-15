
import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
    name: {
        type: "string",
        required: [true, "must provide todo name"]
    },
    description: {
        type: "string",
        required: [true, "must provide todo description"]
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

export const TodoModel = mongoose.model('Todo', TodoSchema);



