const express = require("express");
const storeRouter = express.Router();
const controller = require("../controller/userController");

storeRouter.get("/", controller.getIndex);
storeRouter.get("/book-list", controller.getBookList);
storeRouter.get("/booked", controller.getBooked);
storeRouter.get("/favourite", controller.getfavourite);
storeRouter.get("/book-detail/:bookId", controller.getBookDetail);
storeRouter.post("/favourite", controller.postAddFav);
storeRouter.post("/booked", controller.postOrderBook);
storeRouter.post("/delete-fav/:bookId", controller.postDeleteFav);
storeRouter.post("/delete-booking/:bookId", controller.postDeleteOrder);
storeRouter.post("/address", controller.postAddress);

module.exports = storeRouter;
