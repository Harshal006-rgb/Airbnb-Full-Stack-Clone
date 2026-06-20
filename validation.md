# Form Validations
When we enter data in the form, the browser and/or the web server will check to see that the data is in the **correct format** and **within the constraints** set by the application

ui changes for validations -> 
https://getbootstrap.com/docs/5.0/forms/validation/n.

#ServerSide Validation

1st method ->
```javascript
//Create Route
app.post("/listings" , wrapAsync(async(req,res,next) => {
    if(!req.body || !req.body.listing){
        // 400 bad request -> client ki galti 
        throw new ExpressError(400,"Please provide a valid listing");
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}))
```
2nd method ->
we can validate data on server side using joi

```javascript
app.post("/listings" , wrapAsync(async(req,res,next) => {
    let result = listingSchema.validate(req.body);
    console.log(result);
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}))
```

3rd method -> creating a middleware ->
```javascript



