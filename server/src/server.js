const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = require("./app");
const connectDB = require("./config/db");
const { bootstrapAdmin } = require("./controllers/adminController");

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await bootstrapAdmin();

  app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
  });
};

startServer();
