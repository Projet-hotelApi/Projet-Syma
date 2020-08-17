const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const Review = require("../model/Review");
const Ad = require("../model/Ad");
const User = require("../model/User");
const user = require("../routes/user");
const ad = require("../routes/ad");

const reviewsTotal = (user) => {
  if (user.reviews.length === 0) {
    return "Any reviews has been posted yet";
  }
  let rating = 0;
  for (let i = 0; i < user.reviews.length; i++) {
    rating += user.reviews[i].rating;
  }
  rating = rating / user.reviews.length;
  rating = Number(rating.toFixed(1));
  return rating;
};

// Poster un review sur l'article commandé qui s'affichera sur le profil de user
// is authenticated pour pouvoir poster
// afficher les reviews dans les users

router.post("/create-review", isAuthenticated, async (req, res) => {
  try {
    const ad = req.fields.id;
    const ratingNumber = req.fields.ratingNumber;
    const title = req.fields.title;
    const description = req.fields.description;
    const adFounded = await Ad.findById(req.fields.id);
  } catch (error) {
    console.log(error.message);
  }
});

// router.post("ad/postReview")

module.exports = router;

// router.post("/review/create", async (req, res) => {
//   try {
//     let productId = req.body.product;
//     let newRating = req.body.rating;
//     let newComment = req.body.comment;
//     let newUser = req.body.user;
//     const product = await Product.findById(productId).populate("reviews");

//     if (product) {
//       // Garantir l'existance du tableau reviews
//       if (product.reviews === undefined) {
//         product.reviews = [];
//       }

//       const review = new Review({
//         rating: newRating,
//         comment: newComment,
//         user: newUser
//       });

//       await review.save();

//       // Ajoute l'avis dans le produit
//       product.reviews.push(review);

//       // Mettre à jour la note moyenne
//       const rating = calculateRating(product);
//       product.averageRating = rating;

//       // Sauvegarder les modifications du produit
//       await product.save();

//       res.json(review);
//     } else {
//       res.status(400).json({ message: "Product not found" });
//     }
//   } catch (error) {
//     res.json({ message: error.message });
//   }
// });
