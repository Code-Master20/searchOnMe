const express = require("express");
const { getAssets } = require("../controllers/assetController");

const router = express.Router();

router.get("/", getAssets);

module.exports = router;
