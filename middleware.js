module.exports.isLoggedIn = (req,res,next) => {
    // check is user has loggind in or not (check authentication)
    if(!req.isAuthenticated()){
        // to save that url where user was trying to go after login he will be redirected there
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}