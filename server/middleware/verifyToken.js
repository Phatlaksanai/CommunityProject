const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json("Not logged in");
  }

  jwt.verify(token, process.env.JWT_SECRETKEY, (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token is invalid");
    }

    req.user = userInfo; // user.id จะอยู่ตรงนี้
    next();
  });
};

module.exports = verifyToken;