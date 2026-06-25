# Passport & Authentication Notes 🔑

A concise, step-by-step code reference for implementing user authorization (Signup, Login, Logout, Route Protection, and Resource Authorization) using Passport, Passport-Local, and Passport-Local-Mongoose.

---

## 🚀 Setup Flow (Step-by-Step)

### Step 1: Install Dependencies
```bash
npm install passport passport-local passport-local-mongoose express-session connect-flash
```

### Step 2: Define User Schema (`models/user.js`)
Passport-Local-Mongoose automatically adds a `username`, `hash`, and `salt` field to our schema.
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    }
});

// Plugin automatically handles username/password hashing & salting
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
```

### Step 3: Configure Session & Passport (`app.js`)
Initialize Passport session management **after** session middleware.
```javascript
const session = require("express-session");
const passport = require("passport");   
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// 1. Session Config
const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, 
    }
};
app.use(session(sessionOptions));

// 2. Passport Initialization (MUST be after app.use(session(...)))
app.use(passport.initialize());
app.use(passport.session());

// 3. Configure Local Strategy
passport.use(new LocalStrategy(User.authenticate())); // Use authenticate method from passport-local-mongoose

// 4. Serialize & Deserialize (Store & retrieve user info in session)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
```

---

## 🛠️ Key Passport Methods & Concepts

### 1. `req.user`
*   **What it is**: An object containing the currently authenticated user's details (retrieved from the database on every request via `passport.deserializeUser()`).
*   **Value**:
    *   If **logged in**: It contains the Mongoose user document (e.g., `{ _id: ..., username: ..., email: ... }`).
    *   If **not logged in**: It is `undefined`.
*   **Usage**: Check if a user is logged in, show personalized data, or verify resource ownership.

---

### 2. `req.login(user, callback)`
*   **What it is**: Passport method to establish a login session manually.
*   **Usage**: Usually used during **signup** to automatically log in the user immediately after registering.
*   **Code Example**:
```javascript
// routes/user.js
router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        
        // Establish login session automatically
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err); // Pass error to global error handler
            }
            req.flash("success", "Welcome to Wonderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));
```

---

### 3. `req.logout(callback)`
*   **What it is**: Passport method to terminate the user's login session and clear `req.user`.
*   **Usage**: Used in the `/logout` route.
*   **Code Example**:
```javascript
// routes/user.js
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); // Handle logout error
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
});
```

---

## 🛡️ Authentication & Authorization Middleware

### 1. `isLoggedIn` (Authentication Check)
Checks if the user is authenticated globally before letting them access specific routes.
```javascript
// middleware.js
module.exports.isLoggedIn = (req, res, next) => {
    // req.isAuthenticated() is a Passport method returning true/false
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // Save original URL for redirection post-login
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};
```

### 2. `isOwner` (Authorization Check for Listings)
Verifies if the logged-in user is the actual owner of a listing before allowing modifications.
```javascript
// middleware.js
const Listing = require("./models/listing.js");

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    
    // Check if the current user ID matches the owner's ID
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
```

### 3. `isReviewAuthor` (Authorization Check for Reviews)
Verifies if the logged-in user is the actual author of a review before allowing deletion.
```javascript
// middleware.js
const Review = require("./models/review.js");

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    
    // Check if the current user ID matches the author's ID
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
```

---

## 🔄 Login & Post-Login Redirection Flow

### Step 1: Save the URL User was Trying to Visit
In `isLoggedIn` middleware, store the destination URL:
```javascript
req.session.redirectUrl = req.originalUrl;
```

### Step 2: Transfer Session URL to `res.locals`
Passport clears session variables upon successful login. We run a middleware *before* `passport.authenticate` to copy the URL to `res.locals`:
```javascript
// middleware.js
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
```

### Step 3: Implement Post-Login Redirect Route
```javascript
// routes/user.js
const { saveRedirectUrl } = require("../middleware.js");

router.post("/login", 
    saveRedirectUrl, 
    passport.authenticate("local", { 
        failureRedirect: "/login", 
        failureFlash: true 
    }), 
    async (req, res) => {
        req.flash("success", "Welcome back to Wonderlust!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
);
```

---

## 🎨 Rendering Navbar Dynamically
Pass `req.user` to `res.locals.currUser` globally:
```javascript
// app.js
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // Available in all EJS templates
    next();
});
```

Show/hide links based on login status in navbar:
```html
<!-- views/includes/navbar.ejs -->
<div class="navbar-nav ms-auto">
  <% if (!currUser) { %>
    <a class="nav-link" href="/login">Login</a>
    <a class="nav-link" href="/signup">Signup</a>
  <% } else { %>
    <a class="nav-link" href="/logout">Logout</a>
    <a class="nav-link" href="#">@<%= currUser.username %></a>
  <% } %>
</div>
```
