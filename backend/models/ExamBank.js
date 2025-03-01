const mongoose = require("mongoose");

const examBankSchema = new mongoose.Schema({
  id: String,
  type: String,
  Question: String,
  A: String,
  B: String,
  C: String,
  D: String,
  E: String,
  correctAnswer: String,
  description: String,
  inCorrectCount: Number,
  image:String
});

module.exports = mongoose.model("ExamBank", examBankSchema);