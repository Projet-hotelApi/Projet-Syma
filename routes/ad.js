const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

//const userRoute = require("./user");
const user = require("../routes/user");
const Ad = require("../model/Ad");
const User = require("../model/User");

const app = express();
app.use(formidable({ multiples: true }));

const isAuthenticated = require("../middleware/isAuthenticated");

cloudinary.config({
  cloud_name: "dbxmpuzvk",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// body - form-data
// Pb de photos :
// UPDATER PLUSIEURS IMAGES, CHECKER COURS SUR CLOUDINARY !!
// https://apollo.lereacteur.io/course/5e189e582182e808620a935a?c=ckbdclxrs008r0ntk4lmnafws
// video cours Farid upload cloudinary à partir de 20 min
// https://apollo.lereacteur.io/course/5e189e582182e808620a935a?c=ckbdclxr2008m0ntk5dz9by3a
router.post("/ad/publish", isAuthenticated, async (req, res) => {
  try {
    // console.log("fields", req.fields); // OK
    //console.log("files", req.files); // OK
    const price = req.fields.price;
    const description = req.fields.description;
    const title = req.fields.title;
    const tabKeysPicture = Object.keys(req.files);
    const condition = req.fields.condition;
    const brand = req.fields.brand;
    const size = req.fields.size;
    //console.log("size", size);
    //console.log("price", price);
    //console.log("picture", picture);
    // console.log("description", description);
    //console.log("brand", brand);
    //console.log("title", title);
    //console.log("condition", condition);
    let results = {};
    if (
      tabKeysPicture &&
      price &&
      description &&
      title &&
      condition &&
      brand &&
      size
    ) {
      if (title.length > 3) {
        if (description.length > 10) {
          if (tabKeysPicture.length >= 1 && tabKeysPicture.length <= 5) {
            tabKeysPicture.forEach(async (fileKey) => {
              const file = req.files[fileKey];
              const result = await cloudinary.uploader.upload(file.path);
              console.log("result de l'upload tsemort ===>", result);
              results[fileKey] = {
                success: true,
                result: result,
              };
              if (Object.keys(results).length === tabKeysPicture.length) {
                const newAd = new Ad({
                  title: title,
                  description: description,
                  price: price,
                  picture: [result.secure_url],
                  creator: req.user._id,
                  created: new Date(),
                  condition: condition,
                  brand: brand,
                  size: size,
                });
                await newAd.save();
                const user = await User.findById(req.user._id);
                let articles = user.articles;
                articles.push(newAd._id);
                await User.findByIdAndUpdate(req.user._id, {
                  articles: articles,
                });

                //await user.articles.push(newAd)

                // Obtenir req.fields.username & req.fields.email
                //  const data = {
                //    from : "Syma <syma@" + MAILGUN_DOMAIN + ">",
                //    to : req.fields.email,
                //    subject : "SyMa - Your recently created account",
                //    text : "Dear" + req.fields.firstName + "\br Un article a été ajouté ! Voici les détails : "
                //  }
                //  mailgun.messages().send(data, (error, body) => {
                //   console.log(body);
                //   console.log(error);
                // });
                res.status(200).json({
                  id: newAd.id,
                  title: newAd.title,
                  description: newAd.description,
                  price: newAd.price,
                  picture: newAd.picture,
                  condition: newAd.condition,
                  brand: newAd.brand,
                  size: newAd.size,
                  creator: req.user.username,
                });
              }
            });
          } else {
            res.status(400).json({
              message:
                "To post an add, please use minimum 1 picture and maximum 5 pictures",
            });
          }
        } else {
          res.status(400).json({
            message: "Use more than 10 caracters for the description",
          });
        }
      } else {
        res
          .status(400)
          .json({ message: "Use more than 3 caracters for the title" });
      }
    } else {
      res.status(400).json({
        message:
          "To post an add, please enter a price, a description, a picture, a title and the informations regarding the product to sell (condition, brand, size)",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// OK mais renvoi creator : id au lieu de creator : username ?
// permettra au clic sur le creator de faire la recherche user/search par username !
router.get("/ad", async (req, res) => {
  try {
    const ad = await Ad.find().populate("creator");
    //  res.status(200).json(ad);
    console.log(ad);
    res.status(200).json(ad);
    // json({
    //   id: ad.id,
    //   title: ad.title,
    //   description: ad.description,
    //   price: ad.price,
    //   picture: ad.picture,
    //   // ad.creator,
    //   creator: {
    //     username: ad.creator.username,
    //     id: ad.creator.id,
    //   },
    //   created: ad.created,
    //   condition: ad.condition,
    //   brand: ad.brand,
    //   size: ad.size,
    // });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// NE MARCHE PAS
// PAR TITLE => id dans route ??
//router.post("/ad/:id", async (req, res)
//router.post("/ad/publish/upload/:id", async (req, res) => {
router.get("/ad/informations/:id", async (req, res) => {
  try {
    if (req.params.id) {
      const ad = await Ad.findById(req.params.id).populate("creator");
      res.status(200).json(ad);
    } else {
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// Updater les pictures
router.post("/ad/publish/update/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.params.id) {
      if (
        req.fields.title ||
        req.fields.description ||
        req.fields.price ||
        req.fields.brand ||
        req.fields.condition ||
        req.fields.size ||
        req.files.picture
      ) {
        if (req.fields.title) {
          // OK
          const adFounded = await Ad.findByIdAndUpdate(req.params.id, {
            title: req.fields.title,
          });
          await adFounded.save();
        }
        if (req.fields.description) {
          // OK
          const adFounded = await Ad.findByIdAndUpdate(req.params.id, {
            description: req.fields.description,
          });
          await adFounded.save();
        }
        if (req.fields.price) {
          // OK
          const adFounded = await Ad.findByIdAndUpdate(req.params.id, {
            price: req.fields.price,
          });
          await adFounded.save();
        }
        if (req.files.picture) {
          const adFounded = await Ad.findById(req.params.id);
          const result = await cloudinary.uploader.upload(
            req.files.picture.path
          );
          //console.log(result);
          //console.log(req.files);
          //console.log(req.files.picture);
          adFounded.picture.push(result.secure_url);
          // cannot read property push of null
          await adFounded.save();

          // const adFounded = await Ad.findByIdAndUpdate(req.params.id, {
          //   picture: req.fields.picture,
          // });
          // await adFounded.save();
        }
        if (req.fields.brand) {
          // OK
          const adFounded = await Ad.findByIdAndUpdate(req.params.id, {
            brand: req.fields.brand,
          });
          await adFounded.save();
        }
        if (req.fields.condition) {
          // OK
          const adFounded = await Ad.findByIdAndUpdate(req.params.id, {
            condition: req.fields.condition,
          });
          await adFounded.save();
        }
        if (req.fields.size) {
          // OK
          const adFounded = await Ad.findByIdAndUpdate(req.params.id, {
            size: req.fields.size,
          });
          await adFounded.save();
        }
        res.status(200).json({ message: "Your offer has been updated" });
      } else {
        res.status(400).json({
          message: "Changes unauthorized",
        });
      }
    } else {
      res.status(400).json({ message: "Missing id" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// OK
router.get("/ad/delete/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.params.id) {
      const ad = await Ad.findById(req.params.id);
      await ad.deleteOne();
      // findByIdAndRemove
      // obtenir req.fields.email + username
      //  const data = {
      //    from : "Syma <syma@" + MAILGUN_DOMAIN + ">",
      //    to : req.fields.email,
      //    subject : "SyMa - Your recently created account",
      //    text : "Dear" + req.fields.firstName + "\br Offre supprimée "
      //  }
      //  mailgun.messages().send(data, (error, body) => {
      //   console.log(body);
      //   console.log(error);
      // });
      res.status(200).json({ message: "Ad deleted" });
    } else {
      res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// PAge & limit ? Combien annonces par pages ??? ou front ??
router.get("/ad/sort", async (req, res) => {
  try {
    const filters = {};
    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.price = {
        $gte: req.query.priceMin,
      };
    }
    if (req.query.priceMax) {
      if (filters.price) {
        filters.price.$lte = req.query.priceMax;
      } else {
        filters.price = {
          $lte: req.query.priceMax,
        };
      }
    }
    let sort = {};
    if (req.query.sort === "date-asc") {
      sort = { created: "asc" };
    } else if (req.query.sort === "date-desc") {
      sort = { created: "desc" };
    }
    if (req.query.sort === "price-asc") {
      sort = { price: "asc" };
    } else if (req.query.sort === "price-desc") {
      sort = { price: "asc" };
    }

    const ad = await Ad.find(filters).sort(sort).populate("creator");
    res.status(200).json(ad);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// PAS TESTER
router.get("/ad/user/:id", async (req, res) => {
  try {
    if (req.params.id) {
      const userFounded = await User.findById(req.params.id).populate(
        "articles"
      );
      if (!userFounded) {
        res.status(200).json({ message: "User not founded" });
      } else {
        res.status(200).json(userFounded);
      }
    } else {
      res.status(400).json({ message: "Missing parameters" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// if (req.files.picture) {
//   const room = await Room.findById(req.params.id);
//   await cloudinary.uploader.destroy(room.picture[0].id);
//   await cloudinary.uploader.upload(
//     req.files.picture.path,
//     async function(error, result) {
//       const room = await Room.findByIdAndUpdate(req.params.id, {
//         picture: [{ url: result.secure_url, id: result.public_id }]
//       });
//       await room.save();
//     }
//   );
