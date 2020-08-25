const express = require("express");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51HCM9xHLgPiU5LT2uMKGkWGsHLWVsxSHOhfdPaFvWYnxqZhMoK61BxeJrl0KbkwWz3DMimu2jP2YKPyMza4gOHPW00Leg5BEj6"
);
const formidable = require("express-formidable");
const app = express();
app.use(formidable());

const isAuthenticated = require("../middleware/isAuthenticated");
const user = require("../routes/user");
const ad = require("../routes/ad");
const Ad = require("../model/Ad");
const User = require("../model/Ad");

router.post("/payment/:id", isAuthenticated, async (req, res) => {
  const adFounded = await Ad.findById(req.params.id);
  const seller = await User.findById(req.params.id);
  const buyer = await User.findById(req.params.id);
  try {
    const stripeToken = req.fields.stripeToken;
    const response = await stripe.charges.create({
      amount: req.fields.price,
      currency: "eur",
      description: "Acheter " + req.fields.title + " à : " + req.fields.user,
      source: stripeToken,
    });
    console.log(response.status);
    await adFounded.deleteOne();
    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
