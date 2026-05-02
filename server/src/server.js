const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = require("./app");
const { bootstrapAboutContent } = require("./controllers/aboutContentController");
const connectDB = require("./config/db");
const { bootstrapAdmin } = require("./controllers/adminController");
const { bootstrapProjects } = require("./controllers/projectController");

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await bootstrapAdmin();
  await bootstrapAboutContent();
  await bootstrapProjects();

  app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
  });
};

startServer();
