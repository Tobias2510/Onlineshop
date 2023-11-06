const express=require("express");
const helmet=require("helmet");
const mongoose=require("mongoose");
const session=require("express-session");
const User=require("./database/User");
const Product=require("./database/Product");
const ShoppingCart=require("./database/ShoppingCart")
const isAuth=require("./Auth/Auth").isAuth;
const isAdmin=require("./Auth/Auth").isAdmin;
const passport=require('passport');
const fileUpload=require('express-fileupload');
const bcrypt=require("bcrypt");
const fs=require("fs");
const app=express();
app.use(helmet());

const MongoStore=require("connect-mongo");

//Setup
const PORT=1337;
require("dotenv").config();
app.set("view engine", "ejs");

dbOptions={
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(process.env.DB_Connection, dbOptions, ()=>{console.log("Database connected.")}, e=>console.error(e));

//Middleware
app.use(fileUpload());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const sessionStore=MongoStore.create({
    mongoUrl: process.env.DB_Connection,
    collectionName: "sessions"
});

app.use(session({
    secret: process.env.Secret,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000*60*60*24
    }
}));

require('./Auth/passport_config');

app.use(passport.initialize());
app.use(passport.session());

//POST
app.post("/register", async (req, res)=>{ //Datenbankabfrage einbauen um sicherzustellen, dass die email nicht schon existiert.
    let first_name=req.body["first_name"];
    let last_name=req.body["last_name"];
    let date_o_b=req.body["date_o_b"];
    let email=req.body["email"];
    let password=req.body["password"];
    let c_password=req.body["c_password"];
    let admin_code=req.body["admin_code"];
    let admin=false;

    let check_email="";
    let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if(email.match(validRegex)){
        check_email=await User.findOne({email: email});

        if(check_email===null){
            if(password===c_password){
                if(admin_code===process.env.Admin_Code){
                    admin=true;
                }
                registerUser(first_name, last_name, date_o_b, email, password, admin);
                res.redirect("/");
            }
            else{
                let diffPassw=encodeURIComponent(true);
                res.redirect("/?diffrentPasswords="+diffPassw);
            }
        }
        else{
            let emailExists=encodeURIComponent(true);
            res.redirect("/?email_exists="+emailExists);
        }
    }
    else{
        let invalidEmail=encodeURIComponent(true);
        res.redirect("/?invalidEmail="+invalidEmail);
    }
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: '/profile' }));

app.post("/products/add", isAdmin, async(req, res)=>{
    let product_name=req.body["product_name"];
    let product_desc=req.body["product_desc"];
    let price=req.body["price"];
    
    let picture=req.files.picture;

    picture.name=product_name+".png";
    picture.mv(`${__dirname}/public/images/${picture.name}`);

    await addProduct(product_name, product_desc, price);

    res.redirect("/products");
});

app.post("/products/remove", isAdmin, async (req, res)=>{
    let product_name=req.body["product_name"];
    await Product.deleteOne({product_name: product_name});

    fs.unlink(`${__dirname}/public/images/${product_name}.png`, (error) => {
        if (error) {
          console.error(`Error deleting file: ${error}`);
          return;
        }
      });

    console.log("One item removed!");
    res.redirect("/products");
});

app.post("/products/change", isAdmin, async (req, res)=>{
    let id=req.body["id"];
    let product_name=req.body["product_name"];
    let product_desc=req.body["product_desc"];
    let price=req.body["price"];

    let old_product=await Product.findById(id);
    
    if(req.files!=null){

        fs.unlink(`${__dirname}/public/images/${old_product.product_name}.png`, (error)=>{
            if (error) {
              console.error(`Error deleting file: ${error}`);
              return;
            }
        });

        let picture=req.files.picture;

        picture.name=product_name+".png";
        picture.mv(`${__dirname}/public/images/${picture.name}`);
    }
    else{

        fs.rename(`${__dirname}/public/images/${old_product.product_name}.png`, `${__dirname}/public/images/${product_name}.png`, (error)=>{
            if (error) {
                console.error(`Error deleting file: ${error}`);
                return;
              }
        });
    }
    
    await updateProduct(id, product_name, product_desc, price);

    console.log("One item changed!");
    res.redirect("/products");
});

app.post("/profile/change", isAuth, async (req, res)=>{
    let old_email=req.user.email;
    let first_name=req.body["first_name"];
    let last_name=req.body["last_name"];
    let date_o_b=req.body["date_o_b"];
    let email=req.body["email"];
    let password=req.body["password"];
    let c_password=req.body["c_password"];

    let check_email="";
    let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if(email.match(validRegex)){
        check_email=await User.findOne({email: email});

        if(check_email===null || email===old_email){

            if(password!=="" || c_password!==""){
                if(password===c_password){
                    await changePassword(old_email, password);
                    changeUser(old_email, first_name, last_name, date_o_b, email);
                    res.redirect("/profile");
                }
                else{
                    let diffPassw=encodeURIComponent(true);
                    res.redirect("/profile?diffrentPasswords="+diffPassw);
                }
            }
            else{
                changeUser(old_email, first_name, last_name, date_o_b, email);
                res.redirect("/profile");
            }
        }
        else{
            let emailExists=encodeURIComponent(true);
            res.redirect("/profile?email_exists="+emailExists);
        }
    }
    else{
        let invalidEmail=encodeURIComponent(true);
        res.redirect("/profile?invalidEmail="+invalidEmail);
    }
});

app.post("/profile/shoppingCart/add", isAuth, async (req, res)=>{
    let email=req.user.email;
    let product_name=req.body["product_name"];

    try{
        const product=await Product.findOne({product_name: product_name});

        if(product!==null){

            addToCart(email, product);

            res.redirect("/profile");
        }
        else{
            res.status(404).json({ msg: 'Product not found' });
        }
    }
    catch (err){
        res.status(404).json({ msg: 'Product not found' });
    }
});

app.post("/profile/shoppingCart/remove", isAuth, async (req, res)=>{
    let email=req.user.email;
    let product_name=req.body["product_name"];

    removeFromCart(email, product_name);

    res.redirect("/profile/shoppingCart");
});

//GET
app.get("/", async (req, res)=>{
    res.locals.products=await Product.find({});
    res.locals.loginfailure=req.query.loginfailure;
    res.locals.diffrentPasswords=req.query.diffrentPasswords;
    res.locals.email_exists=req.query.email_exists;
    res.locals.invalidEmail=req.query.invalidEmail;
    res.render("index");
});

app.get("/login-failure", (req, res)=>{
    let loginFailure=encodeURIComponent(true);
    res.redirect("/?loginfailure="+loginFailure);
});

app.get("/profile", isAuth, async (req, res)=>{
    res.locals.user=req.user;
    res.locals.products=await Product.find({});
    res.locals.email_exists=req.query.email_exists;
    res.locals.invalidEmail=req.query.invalidEmail;
    res.locals.diffrentPasswords=req.query.diffrentPasswords;
    res.render("profile");
});

app.get("/products", isAdmin, async (req, res)=>{
    res.locals.products=await Product.find({});
    res.render("products");
});

app.get("/product/:product_name", async (req, res)=>{
    let product=await Product.findOne({product_name: req.params.product_name});
    let is_logged_in=false;

    if(product!=null){

        if(req.user!==undefined){
            is_logged_in=true;
        }

        res.locals.product=product;
        res.locals.is_logged_in=is_logged_in;
        res.render("product_page");
    }
    else{
        res.status(404).json({ msg: 'Page not found' });
    }
});

app.get("/profile/shoppingCart", isAuth, async (req, res)=>{
    let email=req.user.email;
    let shoppingCart=await ShoppingCart.findOne({email: email});
    res.locals.arr=shoppingCart.products;
    res.render("shoppingCart");
});

app.get("/logout", (req, res, next) => {
    req.session.destroy((err)=>{
        if(err){
            return next(err);
        }
    });
    res.redirect("/");
});

//Functions
async function registerUser(first_name, last_name, date_o_b, email, password, admin){
    const user=await User.create({
        first_name: first_name,
        last_name: last_name,
        date_o_b: date_o_b,
        email: email,
        password: password,
        admin: admin
    });

    const shoppingCart=await ShoppingCart.create({
        email: email
    });

    console.log("New user signed up!");
}

async function changeUser(old_email, first_name, last_name, date_o_b, email){
    const user=await User.updateOne({email: old_email},
        {
            first_name: first_name,
            last_name: last_name,
            date_o_b: date_o_b,
            email: email
        }
    );
    const shoppingCart=await ShoppingCart.updateOne({email: old_email},
        {
            email: email
        }
    );
}

async function changePassword(old_email, password){

    const user=await User.updateOne({email: old_email},
        {
            password: password
        }
    );
}

async function addToCart(email, product){
    const cart=await ShoppingCart.updateOne({email: email},
        {
            $push:{products: product}
        }
    );
}

async function removeFromCart(email, product_name){

    const cart=await ShoppingCart.updateOne({email: email},
        {
            $pull:{products: {product_name: product_name}}
        }
    );
}

async function addProduct(product_name, product_desc, price){
    const product=await Product.create({
        product_name: product_name,
        product_desc: product_desc,
        price: price
    });
    console.log("We have a new Product!");
}

async function updateProduct(id, product_name, product_desc, price){
    const product=await Product.updateOne({_id: id},
        {
        product_name: product_name, 
        product_desc: product_desc, 
        price: price
        }
    );
}

//Listen
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}...`);
    console.log(`url: localhost:${PORT}`);
});