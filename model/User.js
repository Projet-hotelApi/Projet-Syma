const mongoose = require("mongoose");
const User = mongoose.model("User", {
  token: String,
  hash: String,
  salt: String,
  email: { type: String, unique: true },
  username: { type: String, required: true },
  description: String,
  picture: [],
  // picture: { type: String, default: "" },
  globalNote: Number,
  reviews: {
    ratingValue: Number,
    description: String,
  },
  personnal: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    postalCode: { type: Number, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
  },
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ad",
    },
  ],
});
module.exports = User;
