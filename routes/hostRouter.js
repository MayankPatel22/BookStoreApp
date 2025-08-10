const express = require("express");
const hostRouter = express.Router();
const controller = require("../controller/hostController");

hostRouter.get("/add-book", controller.getAddBook);
hostRouter.post("/add-book", controller.getAddedBook);
hostRouter.get("/host-book", controller.getbookHere);
hostRouter.get("/edit-book/:bookId", controller.getEditBook);
hostRouter.post("/edit-book", controller.postEditBook);
hostRouter.post("/delete-book/:bookId", controller.postDeleteBook);

module.exports = hostRouter;
