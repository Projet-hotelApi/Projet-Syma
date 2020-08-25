const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");
const app = express();
app.use(formidable());
const isAuthenticated = require("../middleware/isAuthenticated");
const Review = require("../model/Review");
const Ad = require("../model/Ad");
const User = require("../model/User");
const user = require("../routes/user");
const ad = require("../routes/ad");

router.post("/post-review/:id", isAuthenticated, async (req, res) => {
  try {
    const ratingNumber = req.fields.ratingNumber;
    const description = req.fields.description;
    if (req.params.id) {
      // on recherche le vendeur
      const sellerFounded = await User.findById(req.params.id).populate(
        "reviews"
      );
      //console.log(sellerFounded); // Ok
      if (!ratingNumber) {
        res.status(400).json({ message: "Entrez une note d'évaluation" });
      } else {
        let obj = {};
        if (description) {
          //console.log("description");
          obj.description = description;
        } else {
          //console.log("sans description");
          obj.description = "Rien à ajouter";
        }
        obj.ratingNumber = ratingNumber;
        obj.creator = req.user._id;
        obj.created = new Date();
        const newReview = new Review(obj);
        await newReview.save();
        // on push les reviews dans le user vendeur
        sellerFounded.reviews.push(newReview);
        await sellerFounded.save();
        res.status(200).json(sellerFounded);
      }
    } else {
      res.status(400).json({ message: "Missing parameters" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// router.get("/review/user/:id", async (req, res) => {
//   try {
//     if (req.params.id) {
//       const userFounded = await User.findById(req.params.id);
//       console.log(userFounded);
//       const review = await Review.find();
//       res.status(200).json(review);
//     } else {
//       res.status(400).json({ message: "Missing parameters" });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(400).json({ message: error.message });
//   }
// });

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
