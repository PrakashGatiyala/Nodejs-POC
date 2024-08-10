const { verifyToken } = require("../libraries/auth.lib");

const ensureAuthenticated = (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader) {
    return res
      .status(401)
      .json({ error: "Please authenticate to access this resource" });
  }
  const token = tokenHeader.split(" ")[1];

  // Decode the token to get the payload
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }
  // append the user payload to the request object
  req.user = payload;
  next();
};

const roleAccessMapping = {
  admin: 0,
  subadmin: 1,
  moderator: 5,
  user: 9,
};

function hasAccessLevel(role, accessLevel) {
  return roleAccessMapping[role] <= roleAccessMapping[accessLevel];
}

const ensureAuthorizedToRole = (role) => {
    return (req, res, next) => {
        if (!hasAccessLevel(req.user.role, role)) {
        return res.status(403).json({
            error: "You are Forbidden to access this resource",
        });
        }
        next();
    };
}

module.exports = { ensureAuthenticated, ensureAuthorizedToRole };
