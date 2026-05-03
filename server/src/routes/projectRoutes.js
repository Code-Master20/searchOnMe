const express = require("express");
const { param } = require("express-validator");
const { getProjectById, getProjects } = require("../controllers/projectController");

const router = express.Router();

router.get("/", getProjects);
router.get("/:id", [param("id").isMongoId().withMessage("Invalid project id.")], getProjectById);

module.exports = router;
