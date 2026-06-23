const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const session = require("express-session");  //express sessions
const flash = require('connect-flash'); // needs express sessions

const engine = require("ejs-mate");
app.use(methodOverride("_method"));

//Error Handling Utilities
const ExpressError = require("./utils/ExpressError.js");

//Express Routes
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

//Needs for parsing form data from Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Ejs 
app.set("view engine", "ejs");        
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', engine);        //using ejs mate

//For serving static files from public directory
app.use(express.static(path.join(__dirname, "/public")));




const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connection successful");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}




app.get("/", (req, res) => {
    res.send("Hello World!");
});



const sessionOptions = {
    secret : "mysupersecretstring",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,   //expires after 7 days 
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true, 
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})


// Express Routes
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


app.all("*any", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
})

// Error Handling
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.render("listings/error.ejs", { statusCode, message });
    // res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});