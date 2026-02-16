const express = require("express");
const router = express.Router();
const {
  registerSeller,
  loginSeller,
  addProduct,
  getMyProducts,
  getPublicProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/exporterController");
const upload = require("../middlewares/uploadmiddleware");
const { protect } = require("../middlewares/SellerauthMiddleware");

// 'catalog' field name frontend se match hona chahiye
router.post("/register", upload.single("catalog"), registerSeller);
router.post("/login", loginSeller);
router.post(
  "/add-product",
  protect,
  upload.single("product_image"),
  addProduct,
);
router.get("/my-products", protect, getMyProducts);
router.get("/public-products", getPublicProducts);
router.delete("/delete-product/:id", protect, deleteProduct);
router.put("/update-product/:id",protect,upload.single("product_image"),
  updateProduct,
);

module.exports = router;
