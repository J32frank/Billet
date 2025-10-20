// ...existing code...
require('dotenv').config();
const app = require('./app.js');

if (process.env.VERCEL) {
  // On Vercel export a serverless handler instead of calling listen
  const serverless = require('serverless-http');
  module.exports = serverless(app);
} else {
  const PORT = process.env.PORT || 3000;
  // Local dev: start the server
  app.listen(PORT, ()=> {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment variable is http://localhost:${process.env.PORT} || development mode`);
  });
}
// ...existing code...