const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");



router.get("/signup", (req, res) => {
    res.render("users/singup.ejs");
})

router.post("/singup" , wrapAsync(async (req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser = new User({ email , username });
        const registerUser = await User.register(newUser,password);
        req.flash("success","Welcome to Wonderlust!");
        res.redirect("/listings");
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}));


router.get("/login" , (req,res) => {
    res.render("users/login.ejs")
});


router.post("/login", passport.authenticate("local" , {  // middleware , LOCAL-> strategy implemented in app.js
        failureRedirect: "/login",          // redirection if fails
        failureFlash : true                   // false message if fails
    }) , async(req,res)=>{
        req.flash("success", "Welcome to Wonderlust!");
        res.redirect("/listings");    
})  





module.exports = router;