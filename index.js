const express = require("express");
const mongoose = require("mongoose");
const formidable = require("express-formidable");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(formidable());
app.use(cors());

const userRoute = require("./routes/user");
app.use(userRoute);
const adRoute = require("./routes/ad");
app.use(adRoute);
const isAuthenticated = require("./middleware/isAuthenticated");
app.use(isAuthenticated);
const reviewRoute = require("./routes/review");
app.use(reviewRoute);
// const paymentRoute = require("./routes/payment");
// app.use(paymentRoute);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
