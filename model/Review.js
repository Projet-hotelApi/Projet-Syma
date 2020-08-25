const mongoose = require("mongoose");
const Review = mongoose.model("Review", {
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created: Date,
  ratingNumber: Number,
  description: String,
});
module.exports = Review;
