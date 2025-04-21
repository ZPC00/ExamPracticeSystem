require('dotenv').config()
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const uri = process.env.MONGODB_URI;

const bodyParser = require('body-parser');
const router = require('./routes/router.js');

const app = express();

app.use(bodyParser.json({ limit: '500mb' }));  // Increase limit to 50 MB
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

//Use the Express framework to provide functionality for static files (images).
app.use(express.static('images'));
app.use('/images', express.static('images'))
app.use('/files', express.static('files'))

const corsOptions = {
    origin: 'https://exampracticesystem-frontend.onrender.com',
    credentials: true,
    maxAge: 200
};

app.use(cors(corsOptions));
app.get('/', (req, res) => {
  res.send(' The practice exam system  backend server is running!');
})

//connect to server db
const port = process.env.PORT || 3030;
async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

const startServer = async () => {
  try {
    await connectDB();
    console.log(" MongoDB connect success！");
    app.listen(port,'0.0.0.0', () => {
        console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error(" server failed:", error);
  }
};

startServer()
