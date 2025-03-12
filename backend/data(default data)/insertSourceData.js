require('dotenv').config()
const mongoose = require("mongoose");
const ExamBank = require("../models/ExamBank");
const PracticeBank = require("../models/PracticeBank");
const ExamModes = require("../models/ExamModes");
const UserAccount = require("../models/UserAccount");
let userAccount = require('./userAccount');
let practiceBank = require('./practiceBank');
let examBank = require('./examBank');
let examModes = require('./examModes');


async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}


const InsertScourceData = async () => {
  try {
    await connectDB();
    // Clear existing data
    await ExamBank.deleteMany({});
    await PracticeBank.deleteMany({});
    await ExamModes.deleteMany({});
    await UserAccount.deleteMany({});
    
    // Insert new data
    await ExamBank.insertMany(examBank);
    await PracticeBank.insertMany(practiceBank);
    await ExamModes.create(examModes);
    await UserAccount.insertMany(userAccount);

    console.log("Insert data success!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Insert data failed!", err);
    mongoose.connection.close();
  }
};

InsertScourceData();
