const { check, validationResult } = require("express-validator");
const User = require("../model/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    currentPage: "login",
    isLoggedIn: req.isLoggedIn,
    errors: [],
    oldInput: {},
    user: {},
  });
};
exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).render("auth/login", {
      currentPage: "login",
      isLoggedIn: false,
      errors: ["User doesn't exist"],
      oldInput: { email },
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Invalid Password"],
      oldInput: { email },
      user: {},
    });
  }
  console.log(req.body);
  req.session.isLoggedIn = true;
  req.session.user = user;
  await req.session.save();
  if (req.xhr || req.headers.accept.indexOf("json") > -1) {
    return res.json({ success: true, user });
  }

  res.redirect("/");
};
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({ success: true });
    }
    res.redirect("/login");
  });
};
exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "",
    },
    user: {},
  });
};
exports.postSignUp = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name should be 2 character long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name should be alphabets"),

  check("lastName")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name should be alphabets"),

  check("email")
    .trim()
    .isEmail()
    .withMessage("Please enter valid Email")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password should be atleast 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain atleast one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain atleast one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain atleast one number")
    .matches(/[!@&]/)
    .withMessage("Password should contain atleast one special character")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),

  check("terms").notEmpty().withMessage("Please accept term and condition"),

  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map((arr) => arr.msg),
        oldInput: { firstName, lastName, email, password, userType },
        user: {},
      });
    }
    bcrypt.hash(password, 12).then((hashedPassword) => {
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType,
      });
      user
        .save()
        .then(() => {
          if (req.xhr || req.headers.accept.indexOf("json") > -1) {
            return res.json({ success: true, user });
          }
          res.redirect("/login");
        })
        .catch((err) => {
          return res.status(422).render("auth/signup", {
            currentPage: "signup",
            isLoggedIn: false,
            errors: [err.message],
            oldInput: { firstName, lastName, email, userType },
            user: {},
          });
        });
    });
  },
];
