const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");

const cookieParser = require("cookie-parser");

const session = require("express-session");  //express sessions
const flash = require('connect-flash'); // needs express sessions

const path = require("path");
app.set("view engine", "ejs");        
app.set("views", path.join(__dirname, "views"));

const sessionOptions = {
  secret: "mysupersecretstring" , 
  resave : false, 
  saveUninitialized : true , 
}

app.use(session(sessionOptions)); //middleware
app.use(flash());



app.get("/register" , (req,res)=>{
  let {name = "anonymous"} = req.query;
  req.session.name = name;

  if (name == "anonymous") {
    req.flash("error", "Please enter a valid name");
  } else {
    req.flash("success", "user registered successfully");
  }

  res.redirect("/hello");
  // res.render("page.ejs" , {name : req.session.name , msg : req.flash("success")});
})

app.get("/hello" , (req,res) =>{
  // flash appears only 1 time , after that it becomes empty
  res.locals.successMsg = req.flash("success");  
  res.locals.errorMsg = req.flash("error");  
  res.render("page.ejs" , {name : req.session.name});  
})





// app.get("/reqcount" , (req , res)=>{
//   if(req.session.count) req.session.count ++;
//   else req.session.count = 1;
//   res.send(`You sent a request ${req.session.count} times `);
// })

// app.get("/test", (req, res) => {
//   res.send("test succesfull");
// })






// secretcode for signed cookies
app.use(cookieParser("secretcode"));

app.get("/getsignedcookie", (req, res) => {
  res.cookie("color", "red", { signed: true });
  res.send("done!");
});

app.get("/verify", (req, res) => {
  res.send(req.signedCookies);
});

app.get("/getcookies", (req, res) => {
  res.cookie("name", "Harshal");
  res.cookie("madeIn", "India");
  res.send("sent you some cookies!");
});

app.get("/", (req, res) => {
  let { name } = req.cookies;
  // console.dir(req.cookies);
  res.send(`Hi, ${name}`);
});

app.use("/users", users);
app.use("/posts", posts);

app.listen(3000, () => {
  console.log("server is listening to port 3000");
});
