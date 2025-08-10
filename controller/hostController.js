const Book = require("../model/book");
const fs = require("fs");

exports.getAddBook = (req, res, next) => {
  console.log(req.url, req.method);
  res.render("host/add-book", {
    currentPage: "add-book",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};
exports.getAddedBook = (req, res, next) => {
  const { bookName, price, author, Rating, description } = req.body;
  if (!req.file) {
    console.log("No Image Provided");
    return res.status(422).send("No Img Selected");
  }
  const URL = req.file.path;
  const book = new Book({ bookName, price, author, Rating, URL, description });
  book.save().then(() => {
    console.log("Booked Saved");
  });
  res.redirect("/host/host-book");
};
exports.getbookHere = (req, res, next) => {
  Book.find().then((registeredBook) => {
    res.render("host/host-book", {
      registeredBook: registeredBook,
      currentPage: "host-books",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};
exports.getEditBook = (req, res, next) => {
  const bookId = req.params.bookId;
  const editing = req.query.editing === "true";
  Book.findById(bookId).then((book) => {
    if (!book) {
      return res.redirect("/host/host-book");
    }
    console.log(bookId, editing, book);
    res.render("host/add-book", {
      book: book,
      currentPage: "host-books",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};
exports.postEditBook = (req, res, next) => {
  const { id, bookName, price, author, Rating, description } = req.body;
  Book.findById(id)
    .then((book) => {
      if (!book) {
        console.log("Books Not found");
        return res.redirect("/host/host-book");
      }
      book.bookName = bookName;
      book.price = price;
      book.author = author;
      book.Rating = Rating;
      book.description = description;
      if (req.file) {
        fs.unlink(book.URL, (err) => {
          if (err) {
            console.log("Error while deleting file ", err);
          }
        });
        book.URL = req.file.path;
      }
      return book.save();
    })
    .then(() => {
      res.redirect("/host/host-book");
    })
    .catch((err) => {
      console.log("Error Found", err);
    });
};
exports.postDeleteBook = (req, res, next) => {
  const bookId = req.params.bookId;
  Book.findByIdAndDelete(bookId)
    .then(() => {
      res.redirect("/host/host-book");
    })
    .catch((error) => {
      console.log("Error Found", error);
    });
};
