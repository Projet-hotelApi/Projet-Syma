const userRoute = require("../routes/user");
const User = require("../model/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      // const user = await User.findOne({
      //   token: req.headers.authorization.replace("Bearer ", "")
      // });
      const token = req.headers.authorization.replace("Bearer ", "");
      // console.log(token);
      const userFounded = await User.findOne({ token: token });
      // console.log(userFounded);
      if (!userFounded) {
        return res
          .status(401)
          .json({ message: "User not founded, please try again" });
      } else if (userFounded) {
        req.user = userFounded;
        next();
      }
    } else {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
module.exports = isAuthenticated;
