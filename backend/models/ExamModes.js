const mongoose = require("mongoose");

const examModesSchema = new mongoose.Schema({
  examAvailable: Boolean,
  examName: String,
  examStartTime: Date,
  examEndTime: Date,
  examTime: Number,
  examSingleChoiceCount: Number,
  examSingleChoiceScore: Number,
  examMultipleChoiceCount: Number,
  examMultipleChoiceScore: Number,
  examFillingBlankCount: Number,
  examFillingBlankScore: Number,
  examJudgementsCount: Number,
  examJudgementsScore: Number,
  examStudentGradesVisible: Boolean,
  examStudentAnswerVisible: Boolean
});

module.exports = mongoose.model("ExamModes", examModesSchema);