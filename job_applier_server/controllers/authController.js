const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const google = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists, otherwise create one
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        picture,
        password: "googleLogin", // No password since Google manages it
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
    console.error(err);
    res.status(500).json({ error: "Google authentication failed" });
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
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
