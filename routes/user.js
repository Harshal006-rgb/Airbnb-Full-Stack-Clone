const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

const {saveRedirectUrl} = require("../middleware.js"); // for saving redirecturl

//controller
const userController = require("../controllers/users.js")


router
.route("/signup")
    .get( userController.renderSignupForm )
    .post(wrapAsync(userController.signup));


router
.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl , passport.authenticate("local" , {  // middleware , LOCAL-> strategy implemented in app.js
        failureRedirect: "/login",          // redirection if fails
        failureFlash : true                   // false message if fails
    }) , userController.login)  


router.get("/logout", userController.logout);


module.exports = router;