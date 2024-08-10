const crypto = require("crypto");
const User = require("../models/user.model");
const {
  userSignupValidationSchema,
  userSigninValidationSchema,
} = require("../libraries/validators/user.validator");
const { createToken, verifyToken } = require("../libraries/auth.lib");

const handleUserSignup = async (req, res) => {
  const validationResult = userSignupValidationSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error });
  }
  const { firstName, lastName, email, password, role } = validationResult.data;
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");

  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hash,
      salt,
      role,
    });
    const token = createToken({ id: user._id, role: user.role });
    res.status(201).json({ data: { id: user._id, token } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleUserSignin = async (req, res) => {
  const validationResult = userSigninValidationSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error });
  }
  const { email, password } = validationResult.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const hash = crypto
      .createHmac("sha256", user.salt)
      .update(password)
      .digest("hex");
    if (hash !== user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = createToken({ id: user._id, role: user.role });

    res.json({ message: `Signin Successful for ${user.firstName}`, token });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

handleGetAllusers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { handleUserSignup, handleUserSignin, handleGetAllusers };
