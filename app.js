const express = require("express");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const ToDo = require("./models/todo");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + "/public"));

app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;
const sessionSecret = crypto.randomBytes(32).toString("hex");
app.use(
  sessions({
    secret: sessionSecret,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.use(flash());

app.set("view engine", "ejs");

const dbURL =
  "mongodb+srv://Admin:<password>@cluster0.7efz7qz.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.render("index", { message: req.flash("message") });
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/signup", async (req, res) => {
  res.render("signup");
});

app.post("/validate", async (req, res) => {
  const user_name = req.body.username;
  const email_id = req.body.email;
  const password = req.body.password;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({
      user_name: user_name,
      email_id: email_id,
      password: hashedPassword,
    });
    await user.save();
    const user_id = user.user_id;
    req.session.user = { user_id };
    return res.redirect("notes");
  } catch (err) {
    req.flash("message", "Account with that email already exists");
    return res.redirect("signin");
  }
});

app.post("/authorise", async (req, res) => {
  const email_id = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email_id: email_id });
    if (!user) {
      req.flash("message", "Invalid email or password");
      return res.redirect("signin");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      req.flash("message", "Invalid email or password");
      return res.redirect("signin");
    }
    const user_id = user.user_id;
    req.session.user = { user_id };
    return res.redirect("notes");
  } catch (err) {
    req.flash("message", "Server Error");
    return res.redirect("signin");
  }
});

app.post("/create", async (req, res) => {
  if (req.session.user) {
    const user_id = req.session.user;
    const note = new ToDo({
      body: req.body.note,
      user_id: user_id.user_id,
    });
    await note.save();
    return res.redirect("notes");
  } else {
    req.flash("message", "Please login to use TooDoo");
    return res.redirect("/");
  }
});

app.post("/delete/:id", async (req, res) => {
  const todoId = req.params.id;
  try {
    await ToDo.deleteOne({ todo_id: todoId });
    return res.redirect("../notes");
  } catch (err) {
    req.flash("message", "Failed to delete note");
    return res.redirect("../notes");
  }
})

app.get("/notes", async (req, res) => {
  if (req.session.user) {
    const user_id = req.session.user;
    const user = await User.findOne({ user_id: user_id.user_id });
    const notes = await ToDo.find({ user_id: user_id.user_id }).lean();
    return res.render("notes", { user, notes });
  } else {
    req.flash("message", "Please login to use TooDoo");
    return res.redirect("/");
  }
});

app.use((req, res) => {
  res.render("notfound");
});
