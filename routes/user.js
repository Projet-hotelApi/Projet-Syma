const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const mailgun = require("mailgun-js");
//const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

const User = require("../model/User");
const isAuthenticated = require("../middleware/isAuthenticated");

const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });
// changer mailgun address
cloudinary.config({
  cloud_name: "dbxmpuzvk",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/user/sign-up", async (req, res) => {
  try {
    const usernameFounded = await User.findOne({
      username: req.fields.username,
    });
    const emailFounded = await User.findOne({ email: req.fields.email });
    if (emailFounded) {
      res
        .status(400)
        .json({ message: "Count already created with this email" });
    } else if (usernameFounded) {
      res
        .status(400)
        .json({ message: "Username already used, please find another one" });
    } else {
      const password = req.fields.password;
      const salt = uid2(15);
      const hash = SHA256(password + salt).toString(encBase64);
      const token = uid2(15);
      const email = req.fields.email;
      const username = req.fields.username;
      const firstName = req.fields.firstName;
      const lastName = req.fields.lastName;
      const postalCode = req.fields.postalCode;
      const city = req.fields.city;
      const address = req.fields.address;
      if (
        email &&
        username &&
        firstName &&
        lastName &&
        postalCode &&
        city &&
        address &&
        password
      ) {
        const newUser = await new User({
          token: token,
          hash: hash,
          salt: salt,
          email: email,
          username: username,
          // globalNote: globalNote,
          // reviews: {
          //   ratingValue: ratingValue,
          //   description: description,
          // },
          personnal: {
            firstName: firstName,
            lastName: lastName,
            postalCode: postalCode,
            address: address,
            city: city,
          },
        });
        await newUser.save();
        // const data = {
        // from: "dehedin.mathilde@" + DOMAIN + "com",
        // from: "Excited User <postmaster@" + DOMAIN + ".com>",
        //   from: "Excited User <me@samples.mailgun.org>",
        //   to: req.fields.email,
        //   subject: "SyMa - Your recently created account",
        //   text:
        //     "Dear" +
        //     req.fields.firstName +
        //     "\br Merci d'avoir choisi SyMa, notre équipe reste à ta disposition pour toute demande supplémentaire. A bientôt et bon shopping parmi nous!",
        // };
        // mg.messages().send(data, (error, body) => {
        //   console.log(body);
        //   console.log(error);
        // });
        res.status(200).json({
          id: newUser.id,
          token: newUser.token,
          email: newUser.email,
          description: newUser.description,
          username: newUser.username,
        });
      } else {
        res.status(400).json({ message: "Missing parameters" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// OK
router.post("/user/log-in", async (req, res) => {
  try {
    const userFounded = await User.findOne({ username: req.fields.username });
    //console.log(userFounded);
    if (userFounded) {
      if (
        SHA256(req.fields.password + userFounded.salt).toString(encBase64) ===
        userFounded.hash
      ) {
        res.status(200).json({
          id: userFounded.id,
          username: userFounded.username,
          token: userFounded.token,
        });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(400).json({ message: "Username not founded" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// OK
router.post("/user/delete", isAuthenticated, async (req, res) => {
  try {
    //console.log("pass", req.fields.password); // OK
    //console.log("user", req.fields.username); // OK
    if (req.fields.username && req.fields.password) {
      const userFounded = await User.findOne({ username: req.fields.username });
      //  console.log("userFounded", userFounded);
      if (
        SHA256(req.fields.password + userFounded.salt).toString(encBase64) ===
        userFounded.hash
      ) {
        await userFounded.deleteOne();
        // Obtenir req.fields.email + req.fields.name
        //  const data = {
        //    from : "Syma <syma@" + MAILGUN_DOMAIN + ">",
        //    to : req.fields.email,
        //    subject : "SyMa - Account deleted",
        //    text : "Dear" + req.fields.firstName + "\br Votre compte a bien été supprimé. "
        //  }
        //  mailgun.messages().send(data, (error, body) => {
        //   console.log(body);
        //   console.log(error);
        // });
        res.status(200).json({ message: "Account deleted" });
      } else {
        res.status(400).json({ message: "Please try again" });
      }
    } else {
      res
        .status(400)
        .json({ message: "Please enter your username and password" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// find articles
// réponse :  "reviews": {} // trouver un moyen pour afficher les reviews = populate ?
// peut être parce qu'elle est vide ? a vérifier
router.post("/user/search", async (req, res) => {
  try {
    const userFounded = await await User.findOne({
      username: req.fields.username,
    });
    if (userFounded) {
      res.status(200).json({
        username: userFounded.username,
        description: userFounded.description,
        city: userFounded.personnal.city,
        picture: userFounded.picture[0].secure_url,
        globalNote: userFounded.globalNote,
        reviews: {
          ratingValue: userFounded.reviews.ratingValue,
          decription: userFounded.reviews.description,
        },
        // articles : [
        //   title, description, price, brand, picture, condition, brand & size
        // ]
      });
    } else {
      res.status(400).json({ message: "Member not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

router.get("/user/informations/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.params.id) {
      const userFounded = await User.findById(req.params.id);
      res.status(200).json(userFounded);
    } else {
      res.status(400).json({ message: "User not founded" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/update-account/:id", isAuthenticated, async (req, res) => {
  console.log(
    "fields",
    req.fields.email,
    req.fields.username,
    req.fields.postalCode
  );
  console.log("file", req.files);
  try {
    if (req.params.id) {
      const userFounded = await User.findById(req.params.id);
      if (
        req.fields.email ||
        req.fields.username ||
        req.fields.postalCode ||
        req.fields.city ||
        req.fields.address ||
        req.fields.description ||
        req.files.photo
      ) {
        if (req.fields.email) {
          // OK
          const userFounded = await User.findByIdAndUpdate(req.params.id, {
            email: req.fields.email,
          });
          await userFounded.save();
        }
        if (req.fields.username) {
          // OK
          const userFounded = await User.findByIdAndUpdate(req.params.id, {
            username: req.fields.username,
          });
          await userFounded.save();
        }
        if (req.fields.description) {
          // OK
          const userFounded = await User.findByIdAndUpdate(req.params.id, {
            description: req.fields.description,
          });
          await userFounded.save();
        }
        if (req.fields.postalCode) {
          // OK
          const userFounded = await User.findById(req.params.id);
          userFounded.personnal.postalCode = req.fields.postalCode;
          await userFounded.save();
        }
        if (req.fields.city) {
          // OK
          const userFounded = await User.findById(req.params.id);
          userFounded.personnal.city = req.fields.city;
          await userFounded.save();
        }
        if (req.fields.address) {
          // OK
          const userFounded = await User.findById(req.params.id);
          userFounded.personnal.address = req.fields.address;
          await userFounded.save();
        }
        if (req.files.photo) {
          console.log(1);
          console.log(req.files.photo.path);
          const userFounded = await User.findById(req.params.id);
          console.log(2);
          const result = await cloudinary.uploader.upload(req.files.photo.path);
          console.log(result.secure_url);
          // console.log("result", result.path);
          userFounded.picture.push(result.secure_url);
          console.log(4);
          await userFounded.save();
        }
        res.status(200).json(userFounded);
      } else {
        res.status(400).json({ message: "Changes unauthorized" });
      }
    } else {
      res.status(400).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// router.get("/users", async (req, res) => {
//   // const details = (user) => {  let informations = "";
//   //   for (let i = 0; i < user.length; i++) {  informations += user[i].username;
//   // return informations; }; console.log("essai", details(user));
//   try {
//     const users = await User.find();
//     // populate("personnal", "address")
//     //console.log("user ==", user); // OK
//     // console.log(user[0].username); // ChaCha
//     // res.status(200).json(user[0].username); // ChaCha
//     // "message": "Cannot read property 'city' of undefined"
//     // "message": "Cannot read property 'ratingValue' of undefined"
//     res.status(200).json({
//       username: users.username,
//       description: users.description,
//       city: users.personnal.city,
//       picture: users.picture,
//       globalNote: users.globalNote,
//       reviews: {
//         ratingValue: users.reviews.ratingValue,
//         decription: users.reviews.description,
//       },
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.status(400).json({ message: error.message });
//   }
// });

// await cloudinary.uploader.upload(
//   req.files.picture.path,
//   async function (error, result) {
//     const user = await User.findByIdAndUpdate(req.params.id, {
//       picture: req.files.picture,
//     });
//     await user.save();
//   }
// );
// [{ url: result.secure_url, id: result.public_id }]
