const express = require("express");
const router = express.Router();
const createStripe = require("stripe");
const formidable = require("express-formidable");
const app = express();
app.use(formidable());

// STRIPPPPPPPEEEEEEEEE
const stripe = require("stripe")("sk_test_votreCléPrivée");
// const stripe = XXXX

const isAuthenticated = require("../middleware/isAutenticated");

router.post("/payment/:id", isAuthenticated, async (req, res) => {
  try {
    const stripeToken = req.fields.stripeToken;
    const response = await stripe.charges.create({
      amount: req.fields.price,
      currency: "eur",
      description:
        "Votre achat concerne " +
        req.fields.title +
        " au membre : " +
        req.fields.user,
      source: stripeToken,
    });
    // supprime add (reference pour ad/delete/id) - faire copier / coller
    console.log(response.status);
    let;
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
