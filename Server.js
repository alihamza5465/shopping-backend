import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose";
import cors from "cors";
import { User } from "./userDataModal.js";
import {Product} from "./product.js";
import {Cart} from "./cartModal.js"


const app  = express()
dotenv.config()

const PORT = process.env.PORT || 4000;
const mongose = process.env.MONGOURL 
app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Still correct to explicitly allow all
    credentials: true,
  })
);


mongoose.connect(mongose).then( () =>{
    console.log("Database Connect Successfuly")
    app.listen(PORT, (req,res) =>{
        console.log("Server Running On " + PORT)
    })
})
.catch( (error) => console.log(error))

app.post("/userdata", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exist" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post("/signin", async (req, res)=>{
    const {email, password} = req.body;
    try {
        const isAdmin = email === "admin@gmail.com" && password === "qweqwe";
        const role = isAdmin ? "admin" : "user";
        const existingUser = await User.findOne({ email: email });
        if(!existingUser){
            return res.status(404).json({message : "User Not Found"})
        }   
        if(existingUser.password !== password){
            return res.status(400).json({message : "Invalid Credentials"})
        }
        res.status(200).json({message : "Login Successful", user : existingUser, role : role})
    } catch (error) {
        res.status(500).json({message : error.message})
    }
})

app.post("/products", async (req, res) =>{
  const {name, price, description, imageUrl, category} = req.body;
  try {
    const newProduct = new Product({name, price, description, imageUrl, category})
    await newProduct.save();
    res.status(201).json({message : "Product Added Successfully", product : newProduct})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
})

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find(); // Get all products
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.delete("/api/products/:id", async (req, res) =>{
  const {id} = req.params;
  console.log(id)
  try {
    const deletedProduct = await Product.findByIdAndDelete(id); 
    if(!deletedProduct){
      return res.status(404).json({message : "Product Not Found"})
    }
    res.status(200).json({message : "Product Deleted Successfully", product : deletedProduct})
  } catch (error) {
    res.status(500).json({message : error.message})
  } 
})

app.put("/api/products/:id", async (req, res) =>{
  const {id} = req.params;
  const {name, price, description,  category} = req.body;
  try{
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {name, price, description, category},
      {new : true}
    );  
    if(!updatedProduct){
      return res.status(404).json({message : "Product Not Found"})
    }
    res.status(200).json({message : "Product Updated Successfully", product : updatedProduct})
  } catch (error) {
    res.status(500).json({message : error.message}) 

  }
})

app.post("/cartitem", async (req, res) =>{
  const {userID, productID} = req.body;
  
  try {
    const existID = await Cart.findOne({userID })
  if(existID){
      const existProduct = await Cart.findOne({productID})
      if(existProduct){
        return res.status(200).json({message: "Product already exist"})}
      existID.productID.push( productID)
      
      await existID.save();
      return res.status(200).json({ message: "Product added to cart", cart: existID });
  }
    const newCart = new Cart({userID, productID})
    await newCart.save()
    res.status(201).json({message: "Cart Save", cart: newCart})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
})