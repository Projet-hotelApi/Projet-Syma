const mongoose = require("mongoose");
const User = mongoose.model("Review", {
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created: Date,
  ratingNumber: Number,
  description: String,
});
module.exports = User;
