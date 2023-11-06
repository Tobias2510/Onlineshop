const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const bcrypt=require("bcrypt");
const User=require("../database/User");

const customFields = { //names from the form
    usernameField: 'email',
    passwordField: 'password'
};

const verifyCallback=(username, password, done)=>{
    User.findOne({email: username})
    .then((user)=>{

        if(!user){
            return done(null, false);
        }

        bcrypt.compare(password, user.password, (err, result)=>{
            if(result){
                return done(null, user);
            }
            else{
                return done(null, false);
            }
        });
    })
    .catch((err)=>{
        done(err);
    });
}

const strategy=new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});