require("dotenv").config();
const app = require("./app.js");

const PORT = process.env.PORT || 8000;

// For Render deployment - always start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || "not set"}`);
});
