const express = require("express");
const { getPublicAssets } = require("../controllers/assetController");

const router = express.Router();

router.get("/", getPublicAssets);

module.exports = router;
