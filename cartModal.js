import mongoose from "mongoose"
const cart = {
    userID : {type: String, required: true},
    productID : {type: [String], required: true},
}

export const Cart = mongoose.model("Cart", cart)