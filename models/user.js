import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    mobilenumber: {
        type: String,
        required: true
    },
    firsName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("users", userSchema)
export default User;