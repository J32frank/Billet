require('dotenv').config();
const app = require('./app.js');

const PORT = process.env.PORT || 3000;

//Start Server

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment variable is http://localhost:${process.env.PORT} || development mode`);
});