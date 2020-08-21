const mongoose = require("mongoose");
const User = mongoose.model("Ad", {
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created: Date,
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  picture: [String],
  // état : neuf avec étiquette / neuf sans étiquette / usé / moyen /
  condition: String,
  brand: String,
  size: Number,
});
module.exports = User;
