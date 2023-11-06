const mongoose=require("mongoose");
const bcrypt=require("bcrypt");

const userSchema=new mongoose.Schema({
    first_name: String,
    last_name: String,
    date_o_b: Date,
    email: String,
    password: String,
    admin: Boolean
});

userSchema.pre("save", function(next){
    const user=this;

    bcrypt.hash(user.password, 10, function(err, hash) {
        user.password=hash;
        next();
    });
});

userSchema.pre("updateOne", function(next){
    const update=this.getUpdate();
    if (update.password) {
        bcrypt.hash(update.password, 10, function(err, hash) {
            update.password=hash;
            next();
        });
    }
    else{
        next();
    }
});

module.exports=mongoose.model("User", userSchema);