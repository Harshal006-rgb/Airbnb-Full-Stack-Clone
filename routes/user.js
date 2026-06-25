const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

const {saveRedirectUrl} = require("../middleware.js"); // for saving redirecturl



router.get("/signup", (req, res) => {
    res.render("users/singup.ejs");
})

router.post("/singup" , wrapAsync(async (req,res,next)=>{
    try{
        let {username,email,password} = req.body;
        const newUser = new User({ email , username });
        const registerUser = await User.register(newUser,password);

        //we want to login automatically after singup
        req.login(newUser,(err) => {
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wonderlust!");
            res.redirect("/listings");
        })

    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}));


router.get("/login" , (req,res) => {
    res.render("users/login.ejs")
});


router.post("/login", saveRedirectUrl , passport.authenticate("local" , {  // middleware , LOCAL-> strategy implemented in app.js
        failureRedirect: "/login",          // redirection if fails
        failureFlash : true                   // false message if fails
    }) , async(req,res)=>{
        req.flash("success", "Welcome to Wonderlust!");
        
        //redirect where the user was initially trying to go (saved in saveRedirectUrl)
        res.redirect(res.locals.redirectUrl || "/listings" );  // if redirectUrl is not found then redirect to /listings
})  


router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","logged out successfully");
        res.redirect("/listings");
    })
})





module.exports = router;