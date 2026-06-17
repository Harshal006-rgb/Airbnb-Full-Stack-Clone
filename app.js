const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine('ejs', engine);        //using ejs mate

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connection successful");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}


// app.get("/testlisting", async (req, res) => {
//     let sample = new Listing({
//         title: "My First listing",
//         description: "This is the cheapest and best hotel in the world",
//         price: 100000,
//         location: "Goa",
//         country: "India",
//     });

//     await sample.save();
//     res.send("Sample saved");
// });


//Index Route

app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render( "listings/index.ejs" , {allListings});
})

//New Route
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
})
// error aarah tha as show route upar tha to /new ko bhi id smajh raha tha browser

//Show Route
app.get("/listings/:id", async(req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
})

//Create Route
app.post("/listings" , async(req,res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})

//Edit Route
app.get("/listings/:id/edit", async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
})

//Update Route
app.put("/listings/:id", async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id,req.body.listing);
    res.redirect(`/listings/${id}`);
})

//Delete Route
app.delete("/listings/:id", async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
})

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});