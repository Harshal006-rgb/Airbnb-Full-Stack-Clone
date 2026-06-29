const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/singup.ejs");
}


module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);

        //we want to login automatically after singup
        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wonderlust!");
            res.redirect("/listings");
        })

    }
    catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs")
}


module.exports.login = async (req, res) => {
    req.flash("success", "Welcome to Wonderlust!");
    //redirect where the user was initially trying to go (saved in saveRedirectUrl)
    res.redirect(res.locals.redirectUrl || "/listings");  // if redirectUrl is not found then redirect to /listings
}

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "logged out successfully");
        res.redirect("/listings");
    })
}


