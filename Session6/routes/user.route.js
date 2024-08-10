const express = require("express");
const {
  handleUserSignup,
  handleUserSignin,
  handleGetAllusers,
} = require("../controllers/user.controller");
const {
  ensureAuthenticated,
  ensureAuthorizedToRole,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/",
  ensureAuthenticated,
  ensureAuthorizedToRole("subadmin"),
  handleGetAllusers
);

router.post("/signup", handleUserSignup);

router.get("/login", handleUserSignin);

module.exports = router;
