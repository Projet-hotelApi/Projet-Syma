const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();
const app = express();
app.use(formidable());

const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

router.post("/form", (req, res) => {
  console.log(1);
  console.log(req.fields);
  const firstname = req.fields.firstname;
  const lastname = req.fields.lastname;
  const email = req.fields.email;
  const subject = req.fields.subject;
  const message = req.fields.message;

  const data = {
    from: email,
    to: "dehedin.mathilde@gmail.com",
    firstname: firstname,
    lastname: lastname,
    subject: subject,
    text: message,
  };
  mg.messages().send(data, (error, body) => {
    console.log(body);
    console.log(error);
  });
  res
    .status(200)
    .json({ message: "Votre message a été envoyé. Nous vous remercions" });
});

module.exports = router;
