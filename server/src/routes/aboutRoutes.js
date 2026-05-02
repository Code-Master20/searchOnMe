const express = require("express");
const { getAboutContent } = require("../controllers/aboutContentController");

const router = express.Router();

router.get("/", getAboutContent);

module.exports = router;
