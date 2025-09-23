import mongoose from "mongoose";
const userDataSchema = {
    username: {type: String , required: true},
    email: {type: String , required: true},
    password: {type: String , required: true},
    createdAt : {type : Date,}

}

export const User = mongoose.model("User", userDataSchema);