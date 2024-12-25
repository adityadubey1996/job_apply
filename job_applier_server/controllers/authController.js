const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const google = async (req, res) => {
  const { token } = req.body;
  const userIdFromMiddleware = req.user?.id;
  try {
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (user.guest) {
        // Upgrade guest user to registered user
        user.guest = false;
        user.name = name || user.name; // Update name if available
        user.picture = picture || user.picture; // Update picture if available
        await user.save();
      }
    } else {
      // Create a new user with the same ID from middleware, if provided
      const newUserId = userIdFromMiddleware || new mongoose.Types.ObjectId(); // Use middleware ID or generate a new one

      user = new User({
        _id: newUserId, // Set the custom ID
        name,
        email,
        picture,
        password: "googleLogin", // No password since Google manages it
        guest: false, // Explicitly set guest to false
      });

      await user.save();
    }

    // Generate a JWT token for the user
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token: jwtToken });
  } catch (err) {
    console.error("Google authentication failed:", err.message);
    res.status(500).json({ error: "Google authentication failed" });
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Find the user by ID
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Something terribly went wrong" });
    }

    // Update user details
    user.name = name;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);

    // Save the updated user
    await user.save();

    // Respond with the updated user
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { username: email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.guest) {
      user.guest = false;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout User
const logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

module.exports = { register, login, logout, google };
