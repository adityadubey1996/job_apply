const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer token
  console.log("token from auth middelware", token);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );
    console.log("decoded from auth middleware", decoded);
    if (decoded.isGuest) {
      // Check if guest user exists; create one if not
      let user = await User.findOne({ _id: decoded.id });
      if (!user) {
        user = new User({
          _id: decoded.id,
          name: "Guest",
          email: decoded.email,
          password: "guest",
        });
        await user.save();
      }
      req.user = { id: user._id, guest: true, email: user.email }; // Attach guest user info
    } else {
      req.user = decoded; // Attach authenticated user info
    }
    next();
  } catch (err) {
    console.error("err from auth middleware", err);
    console.error("err from auth middleware for token", token);

    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticate;
