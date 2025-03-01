const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');

const bodyParser = require('body-parser');
const router = require('./routes/router.js');

const app = express();

app.use(bodyParser.json({ limit: '10mb' }));  // Increase limit to 10 MB
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

//Use the Express framework to provide functionality for static files (images).
app.use(express.static('images'));
app.use('/images', express.static('images'))

const corsOptions = {
    origin: '*',
    credentials: true,
    maxAge: 200
};

app.use(cors(corsOptions));
app.use('/', router);

//connect to server db
const port = 3030;
const startServer = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/practiceExamSystem");
    console.log(" MongoDB connect success！");
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error(" server failed:", error);
  }
};

startServer()



