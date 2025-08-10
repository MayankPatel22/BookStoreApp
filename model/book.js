const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  price: { type: Number, required: true },
  author: { type: String, required: true },
  Rating: { type: Number, require: true },
  URL: String,
  description: String,
});

module.exports = mongoose.model("Books", bookSchema);
