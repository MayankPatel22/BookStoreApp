const Book = require("../model/book");
const User = require("../model/user");
const mongoose = require("mongoose");

exports.getIndex = (req, res, next) => {
  Book.find().then((registeredBook) => {
    res.render("store/index", {
      registeredBook: registeredBook,
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};
exports.getBookList = (req, res, next) => {
  Book.find().then((registeredBook) => {
    res.render("store/book-list", {
      registeredBook: registeredBook,
      currentPage: "book-list",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};
exports.getBooked = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("orders");

  res.render("store/orders", {
    orderedBook: user.orders,
    currentPage: "booked",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};
exports.getfavourite = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  res.render("store/favourite", {
    favouriteBook: user.favourites,
    currentPage: "favourite",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};
exports.getBookDetail = (req, res, next) => {
  const bookId = req.params.bookId;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    console.warn("Invalid book ID:", bookId);
    return res.redirect("/book-list");
  }

  Book.findById(bookId).then((book) => {
    if (!book) {
      return res.redirect("/book-list");
    }
    console.log(book.URL);
    res.render("store/book-detail", {
      book: book,
      currentPage: "book-list",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};
exports.postAddFav = async (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.session || !req.session.user || !req.session.user._id) {
      console.warn("User not logged in or session expired.");
      return res.redirect("/login");
    }

    const bookId = req.body.id;
    const userId = req.session.user._id;

    const user = await User.findById(userId);
    if (!user) {
      console.warn("User not found in DB.");
      return res.redirect("/login");
    }

    if (!user.favourites.includes(bookId)) {
      user.favourites.push(bookId);
      await user.save();
    }

    res.redirect("/favourite");
  } catch (err) {
    console.error("Error in postAddFav:", err);
    next(err);
  }
};

exports.postOrderBook = async (req, res, next) => {
  const bookId = req.body.id;
  const userId = req.session.user._id;

  const user = await User.findById(userId);
  if (!user.orders.includes(bookId)) {
    user.orders.push(bookId);
    await user.save();
  }
  res.redirect("/booked");
};
exports.postDeleteFav = async (req, res, next) => {
  const bookId = req.params.bookId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(bookId)) {
    user.favourites = user.favourites.filter((fav) => fav != bookId);
    await user.save();
  }
  res.redirect("/favourite");
};
exports.postDeleteOrder = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;

    // Ensure session and user exist
    if (!req.session || !req.session.user || !req.session.user._id) {
      console.warn("User not logged in or session expired.");
      return res.redirect("/login");
    }

    const userId = req.session.user._id;
    const user = await User.findById(userId);

    if (!user) {
      console.warn("User not found in database.");
      return res.redirect("/login");
    }

    if (user.orders.includes(bookId)) {
      user.orders = user.orders.filter((book) => book != bookId);
      await user.save();
    }

    res.redirect("/booked");
  } catch (err) {
    console.error("Error deleting order:", err);
    next(err);
  }
};
exports.postAddress = async (req, res, next) => {
  res.render("store/address");
};
