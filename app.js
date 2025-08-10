const express = require("express");
const path = require("path");
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const rootDir = require("./utils/pathUtil");
const app = express();
const { getError } = require("./controller/error");
const { default: mongoose } = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const { authRouter } = require("./routes/authRouter");
const dbPath = process.env.MONGODB_URI;

app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/store/uploads", express.static(path.join(rootDir, "uploads")));

const store = new MongoDBStore({
  uri: dbPath,
  collection: "session",
});
const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const multerOptions = {
  storage,
  fileFilter,
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOptions).single("URL"));
app.use(
  session({
    secret: "KnowlegdeGate Bootcamp",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});
app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (!req.isLoggedIn) {
    return res.redirect("/login");
  } else {
    next();
  }
});
app.use("/host", hostRouter);

app.use(getError);
const port = 3000;

mongoose
  .connect(dbPath)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server  is running on  http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("Error found", err);
  });
