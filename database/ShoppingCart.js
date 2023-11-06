const mongoose=require("mongoose");

const shoppingCartSchema=new mongoose.Schema({
    email: String,
    products: Array
});

module.exports=mongoose.model("ShoppingCart", shoppingCartSchema);