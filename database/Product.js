const mongoose=require("mongoose");

const productSchema=new mongoose.Schema({
    product_name: String,
    product_desc: String,
    price: Number
});

module.exports=mongoose.model("Product", productSchema);