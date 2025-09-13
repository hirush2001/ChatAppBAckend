import mongoose from "mongoose";

const chatromSchema = mongoose.Schema({
    code: {
        type: String,
        required: true
    }
});

export default mongoose.model("ChatRoom", chatromSchema);