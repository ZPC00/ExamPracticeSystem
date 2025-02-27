const mongoose = require("mongoose");

const userAccountSchema = new mongoose.Schema({
  id: String,
  name: String,
  firstname: String,
  lastname: String,
  password: String,
  Loginrole: String,
  email: String,
  practiceGradesList: [Number],
  examGradesList: [Number],
  examAttemptList: [
    [
      {
        qID: String,
        userAnswer: String,
        correctness: Boolean,
        score: Number
      }
    ]
  ]
});

module.exports = mongoose.model("UserAccount", userAccountSchema);
