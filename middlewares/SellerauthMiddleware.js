const jwt = require("jsonwebtoken");
const Exporter = require("../models/seller"); // Tera Exporter Model

const protect = async (req, res, next) => {
  let token;

  // 1. Check agar header me Authorization hai aur 'Bearer' se start hota hai
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Token nikalna (Bearer <token> -> space ke baad wala part)
      token = req.headers.authorization.split(" ")[1];

      // 2. Token Verify karna
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Check if role is seller
      if (decoded.role !== "seller") {
        return res
          .status(403)
          .json({ message: "Access Denied: Please login as a Seller" });
      }

      // 3. Token se ID nikal kar Database me Seller dhundna
      // .select('-password') password ko return hone se rokta hai (Security)
      req.user = await Exporter.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, Seller not found" });
      }

      // Sab sahi hai toh next step (Controller) par jao
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, Invalid Token" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, No token provided" });
  }
};

module.exports = { protect };
