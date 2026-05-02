const jwt = require("jsonwebtoken");

const getRequestToken = (req) => {
  const authorization = req.headers?.authorization || "";

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return req.cookies?.token || "";
};

const authMiddleware = (req, res, next) => {
  const token = getRequestToken(req);

  if (!token) {
    return res.status(401).json({ message: "Not authorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
};

module.exports = authMiddleware;
