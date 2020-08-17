const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

// Faire un exemple de mail !

const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;
const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

app.post("/contact/formulaire", (req, res) => {
  console.log(req.fields);
  const firstname = req.fields.firstname;
  const lastname = req.fields.lastname;
  const email = req.fields.email;
  const subject = req.fields.subject;
  const message = req.fields.message;

  const data = {
    from: req.fields.email,
    to: "NOTRE ADRESSE MAIL",
    subject: subject,
    text: message,
  };

  mailgun.messages().send(data, (error, body) => {
    console.log(body);
    console.log(error);
  });

  res.status(200).json({ message: "Your request has been sent" });
});
