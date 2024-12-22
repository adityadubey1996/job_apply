const express = require("express");
const {
  register,
  login,
  logout,
  google,
} = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.post("/register", authenticate, register);
router.post("/login", authenticate, login);
router.post("/logout", authenticate, logout);
router.post("/google", authenticate, google);

module.exports = router;
