const mongoose = require("mongoose");
const ExamBank = require("../models/ExamBank");
const PracticeBank = require("../models/PracticeBank");
const ExamModes = require("../models/ExamModes");
const UserAccount = require("../models/UserAccount");
let userAccount = require('./userAccount');
let practiceBank = require('./practiceBank');
let examBank = require('./examBank');
let examModes = require('./examModes');

// 连接 MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/practiceExamSystem")
  .then(() => console.log("connect db success!"))
  .catch(err => console.error("connect db failed!", err));

// 插入数据
const InsertScourceData = async () => {
  try {
    await ExamBank.deleteMany({});
    await PracticeBank.deleteMany({});
    await ExamModes.deleteMany({});
    await UserAccount.deleteMany({});
    
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
