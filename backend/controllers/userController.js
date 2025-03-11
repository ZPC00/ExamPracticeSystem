const _ = require('lodash');
const bcrypt = require('bcryptjs');
const UserAccount = require("../models/UserAccount");
const PracticeBank = require("../models/PracticeBank");
const ExamBank = require("../models/ExamBank");
const ExamModes = require("../models/ExamModes");

// -------------------------------  account management module  --------------------------------------

// get all user account list
exports.getUserAccounts = async (req, res) => {
  try {
      const users = await UserAccount.find(); // get all the user account from mongodb
      res.json(users);
  } catch (error) {
      console.error("get all user failed:", error);
      res.status(500).json({ message: "server error" });
  }
};


// handle log in
exports.login = async (req, res) => {
  const { userName, password, selectedUserRole } = req.body;

  try {
    const loginUser = await UserAccount.findOne({ name: userName });

    // check the user name
    if (!loginUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // check log in role
    if (loginUser.Loginrole !== selectedUserRole) {
      return res.status(401).json({ message: "Invalid Role" });
    }

    // check the password.
    const checkPassword = await bcrypt.compare(password, loginUser.password);
    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    return res.status(200).json({
      message: "User Login Successful",
      user: {
        id: loginUser.id,
        username: loginUser.name,
        role: loginUser.Loginrole
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


// handle search user infor
exports.matchUserInfo = async (req, res) => {
  const { id, username } = req.body;
  let matchUser = null;

  try {
    if (id) {
      matchUser = await UserAccount.findOne({ id: id });
    }

    if (!matchUser && username) {
      matchUser = await UserAccount.findOne({ name: username });
    }

    if (!matchUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    return res.status(200).json({
      message: "User Login Successful",
      matchUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};



// handle delete user account
exports.deleteUser = async (req, res) => {
    const { userName } = req.body;
    try {
        // check user exists
        const user = await UserAccount.findOne({ name : userName });
        if (!user) {
            return res.status(404).json({ error: `User "${userName}" not found.` });
        }

        // delete the account if user exists and response
        await UserAccount.deleteOne({ name: userName });

        // get the updatted all users
        const updatedUserAccount = await UserAccount.find();

        res.status(200).json({
            message: `User "${userName}" has been deleted successfully.`,
            updatedUserAccount,
        });
    } catch (error) {
        console.error("delete account failed:", error);
        res.status(500).json({ message: "server error" });
    }
};

// handle User account maintenance (modify,add)
exports.saveUser = async (req, res) => {
  let { id, name, password, Loginrole, firstname, lastname, email } = req.body;
  try {
    if (id) {
        // Find user by ID
        const selectedUser = await UserAccount.findOne({ id: id });

        if (!selectedUser) {
            return res.status(404).json({ error: `User with ID "${id}" not found.` });
        }

      // encrypted password password if has changed
        const isSamePassword = await bcrypt.compare(password, selectedUser.password);
      
        if (!isSamePassword) {
          const salt = await bcrypt.genSalt(10);
          password = await bcrypt.hash(password, salt);
        }

        // Update user fields
        selectedUser.name = name;
        selectedUser.firstname = firstname;
        selectedUser.lastname = lastname;
        selectedUser.password = password;
        selectedUser.Loginrole = Loginrole;
        selectedUser.email = email;

        // Save updated user
        await selectedUser.save();
        const updatedUserAccount = await UserAccount.find();

        return res.status(200).json({
            message: `User "${name}" has been updated successfully.`,
            updatedUserAccount,
        });

  // add user if user id not exsit
  } else {
    // generate a new id
    const lastUser = await UserAccount.findOne().sort({ id: -1 }).limit(1);
    let newId = "00000001";                // default id is 1
    if (lastUser && lastUser.id) {
      newId = (parseInt(lastUser.id, 10) + 1).toString().padStart(8, '0');
    }

    // encrypted password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    // pack new user data
    let newUser = new UserAccount({
      id: newId,
      name,
      firstname,
      lastname,
      password,
      Loginrole,
      email,
      practiceGradesList: [],
      examGradesList: [],
    });

    // save to the dataset
    await newUser.save();
    const updatedUserAccount = await UserAccount.find();

    return res.status(201).json({
      message: `User "${name}" added successfully.`,
      updatedUserAccount,
    });
  }}catch (error) {
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });}};


// handle update the users' password (change/forget the password)
exports.updatePassword = async (req, res) => {
  let { id, oldPassword, newPassword1, newPassword2} = req.body;

  try {
    const selectedUser = await UserAccount.findOne({id:id});
    
    if (!selectedUser) {
      return res.status(404).json({ message: `User with ID "${id}" not found.` });
    }

    // Verify old password correctness for changing password
    if(oldPassword){
      const isCorrectnessOldPassword = await bcrypt.compare(oldPassword, selectedUser.password);
      if (!isCorrectnessOldPassword) {
        return res.status(401).json({ message: `Old password is incorrect.` });
      }
    }

    // Verify old password if it is the same as old one
    const isSamePassword = await bcrypt.compare(newPassword1, selectedUser.password);
    if (isSamePassword) {
      return res.status(401).json({ message: `New password is the same as the old password` });
    }

    // Verify two password whether they are the same.
    if (newPassword1 !== newPassword2) {
      return res.status(401).json({ message: `Two new passwords do not the same.` });
    }

    // encrypted password
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(newPassword1, salt);

    // update the user's password
    selectedUser.password = passwordHash;
    await selectedUser.save();           // save to the dataset
    const updatedCurrentUser =  await UserAccount.findOne({id:id});

    return res.status(200).json({
      message: `Password has been updated successfully.`,
      updatedCurrentUser,
    });
}catch (error) {
  return res.status(500).json({ error: `Internal Server Error: ${error.message}` })}};


// ------------------------------------------  practice bank module  -----------------------------------------------

// get practice questions bank list
exports.getPracticeBank = async (req, res) => {
  try {
      const questions = await PracticeBank.find(); // get all practice questions from mongodb
      res.json(questions);
  } catch (error) {
      console.error("get all practice questions failed:", error);
      res.status(500).json({ message: "server error" });
  }
};

// handle delete single question
exports.deletePracticeQuestion = async (req, res) => {
  const { id } = req.body;
  try {
  // check user exists
      const selectedQuestion = await PracticeBank.findOne({ id : id });
      if (!selectedQuestion) {
      return res.status(404).json({ error: `The selected question "${id}" not found.` });
        }
      // delete the account if user exists and response
      await PracticeBank.deleteOne({ id: id });

      const updatedPracticeQuestion = await PracticeBank.find()

      res.status(200).json({
          message: `Question with "${id}" has been deleted successfully.`,
          updatedPracticeQuestion,
      });
    } catch (error) {
      console.error("delete question failed:", error);
      res.status(500).json({ message: "server error" });
  }
};

// handle practice bank question maintenance (modify or add the questions)
exports.savePracticeQusetion = async (req, res) => {
  let { id, type, Question, A, B, C, D, E, correctAnswer,description,image } = req.body;
  try {
    if (id) {
        // Find question by ID
        const selectedQuestion = await PracticeBank.findOne({ id: id });

        if (!selectedQuestion) {
            return res.status(404).json({ error: `Question with ID "${id}" not found.` });
        }

        // Update questions fields
        selectedQuestion.type = type;
        selectedQuestion.Question = Question;
        selectedQuestion.A = A;
        selectedQuestion.B = B;
        selectedQuestion.C = C;
        selectedQuestion.D = D;
        selectedQuestion.E = E;
        selectedQuestion.correctAnswer = correctAnswer;
        selectedQuestion.description = description;
        selectedQuestion.image = image;


        // Save updated questions
        await selectedQuestion.save();
        const updatedPracticeQuestion = await PracticeBank.find();

        return res.status(200).json({
            message: `Question with "${id}" has been updated successfully.`,
            updatedPracticeQuestion,
        });

  // add question if question id not exsit
  } else {
    // generate a new id
    const lastQuestion = await PracticeBank.findOne().sort({ id: -1 }).limit(1);
    let newId = "00000001";                // default id is 1
    if (lastQuestion && lastQuestion.id) {
      newId = (parseInt(lastQuestion.id, 10) + 1).toString().padStart(8, '0');
    }

    // pack new question data
    let newQuestion = new PracticeBank({
      id: newId,
      type,
      Question,
      A,
      B,
      C,
      D,
      E,
      correctAnswer,
      description,
      inCorrectCount:0,
      image,
    });

    // save to the dataset
    await newQuestion.save();
    const updatedPracticeQuestion = await PracticeBank.find();

    return res.status(201).json({
      message: `Question with "${newId}" added successfully.`,
      updatedPracticeQuestion,
    });
  }}catch (error) {
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
}};

// add the question by uploading the excel
exports.excelPracticeUpdate = async (req, res) => {
  const updateQ = req.body;

  try {
    // Find max ID
    const lastQuestion = await PracticeBank.findOne().sort({ id: -1 }).limit(1);
    let newId = lastQuestion && lastQuestion.id ? parseInt(lastQuestion.id, 10) + 1 : 1;

    // Store new questions
    const newQuestions = [];

    for (const question of updateQ) {
      const formattedId = newId.toString().padStart(8, '0'); // Generate the new ID
      newId++; // Increment for next question

      let newQuestion = new PracticeBank({
        id: formattedId,
        type: question.type,
        Question: question.Question,
        A: question.A,
        B: question.B,
        C: question.C,
        D: question.D,
        E: question.E,
        correctAnswer: question.correctAnswer,
        description: question.description,
        inCorrectCount: 0,
      });

      await newQuestion.save(); // Save each question
      newQuestions.push(newQuestion);
    }

    // Retrieve updated practice questions
    const updatedPracticeQuestion = await PracticeBank.find();

    return res.status(201).json({
      message: `Added ${updateQ.length} questions successfully.`,
      updatedPracticeQuestion,
    });

  } catch (error) {
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
};


 // Update Practice Mock Exam Result to dataset (after mock exam)
exports.updatePracticeResult = async (req, res) => {
  const { loginUsername, practiceScore, IncorrectQList } = req.body;

  try {
    // Find the user by username
    const selectedUser = await UserAccount.findOne({ name: loginUsername });
    if (!selectedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the practice score to the user's practiceGradesList
    selectedUser.practiceGradesList.push(practiceScore);
    await selectedUser.save();

    // Update inCorrectCount for each question in IncorrectQList
    await PracticeBank.updateMany(
      { id: { $in: IncorrectQList } },
      { $inc: { inCorrectCount: 1 } }
    );

    // Retrieve updated data
    const updatedCurrentUser = await UserAccount.findOne({ name: loginUsername });
    const updatedPracticeQuestion = await PracticeBank.find();

    return res.status(201).json({
      message: "Practice result updated successfully",
      updatedPracticeQuestion,
      updatedCurrentUser,
    });
  } catch (error) {
    console.error("Error updating practice result:", error);
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
};


// ---------------------------------  exam bank module  ----------------------------------

// get exam question bank list
exports.getExamBank = async (req, res) => {
  try {
      const questions = await ExamBank.find(); // get all the exam questions from mongodb
      res.json(questions);
  } catch (error) {
      console.error("get all exam questions failed:", error);
      res.status(500).json({ message: "server error" });
  }
};


// handle delete single question 
exports.deleteExamQuestion = async (req, res) => {
  const { id } = req.body;
  try {
  // check user exists
      const selectedQuestion = await ExamBank.findOne({ id : id });
      if (!selectedQuestion) {
      return res.status(404).json({ error: `The selected question "${id}" not found.` });
        }
      // delete the account if user exists and response
      await ExamBank.deleteOne({ id: id });

      const updatedExamQuestion = await ExamBank.find()

      res.status(200).json({
          message: `Question with "${id}" has been deleted successfully.`,
          updatedExamQuestion,
      });
    } catch (error) {
      console.error("delete question failed:", error);
      res.status(500).json({ message: "server error" });
  }
};


// Exam bank question maintenance (add/modify the questions)
exports.saveExamQusetion = async (req, res) => {
  let { id, type, Question, A, B, C, D, E, correctAnswer,description,image } = req.body;
  try {
    if (id) {
        // Find question by ID
        const selectedQuestion = await ExamBank.findOne({ id: id });

        if (!selectedQuestion) {
            return res.status(404).json({ error: `Question with ID "${id}" not found.` });
        }

        // Update questions fields
        selectedQuestion.type = type;
        selectedQuestion.Question = Question;
        selectedQuestion.A = A;
        selectedQuestion.B = B;
        selectedQuestion.C = C;
        selectedQuestion.D = D;
        selectedQuestion.E = E;
        selectedQuestion.correctAnswer = correctAnswer;
        selectedQuestion.description = description;
        selectedQuestion.image = image;

        // Save updated questions
        await selectedQuestion.save();
        const updatedExamQuestion = await ExamBank.find();

        return res.status(200).json({
            message: `Question with "${id}" has been updated successfully.`,
            updatedExamQuestion,
        });

  // add question if question id not exsit
  } else {
    // generate a new id
    const lastQuestion = await ExamBank.findOne().sort({ id: -1 }).limit(1);
    let newId = "00000001";                // default id is 1
    if (lastQuestion && lastQuestion.id) {
      newId = (parseInt(lastQuestion.id, 10) + 1).toString().padStart(8, '0');
    }

    // pack new question data
    let newQuestion = new ExamBank({
      id: newId,
      type,
      Question,
      A,
      B,
      C,
      D,
      E,
      correctAnswer,
      description,
      inCorrectCount:0,
      image,
    });

    // save to the dataset
    await newQuestion.save();
    const updatedExamQuestion = await ExamBank.find();

    return res.status(201).json({
      message: `Question with "${newId}" added successfully.`,
      updatedExamQuestion,
    });
  }}catch (error) {
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
}};


// add the exam question by uploading the excel
exports.excelExamUpdate = async (req, res) => {
  const updateQ = req.body;

  try {
    // Find max ID
    const lastQuestion = await ExamBank.findOne().sort({ id: -1 }).limit(1);
    let newId = lastQuestion && lastQuestion.id ? parseInt(lastQuestion.id, 10) + 1 : 1;

    // Store new questions
    const newQuestions = [];

    for (const question of updateQ) {
      const formattedId = newId.toString().padStart(8, '0'); // Generate the new ID
      newId++; // Increment for next question

      let newQuestion = new ExamBank({
        id: formattedId,
        type: question.type,
        Question: question.Question,
        A: question.A,
        B: question.B,
        C: question.C,
        D: question.D,
        E: question.E,
        correctAnswer: question.correctAnswer,
        description: question.description,
        inCorrectCount: 0,
      });

      await newQuestion.save(); // Save each question
      newQuestions.push(newQuestion);
    }

    // Retrieve updated practice questions
    const updatedExamQuestion = await ExamBank.find();

    return res.status(201).json({
      message: `Added ${updateQ.length} questions successfully.`,
      updatedExamQuestion,
    });

  } catch (error) {
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
};

// update Exam Result (after exam)
exports.updateExamResult = async (req, res) => {
  let { loginUsername, examScore, IncorrectQList, userAttempt } = req.body;
try{
  const loginUser = await UserAccount.findOne({ name: loginUsername });
  if (loginUser) {
    // Update the Grade information by adding the examScore
    loginUser.examGradesList[loginUser.examGradesList.length - 1] = examScore;
    loginUser.examAttemptList.push(userAttempt)
    await loginUser.save()

    // Update inCorrectCount for each question in IncorrectQList
    await ExamBank.updateMany(
    { id: { $in: IncorrectQList } },
    { $inc: { inCorrectCount: 1 } }
  );

  const updatedCurrentUser = await UserAccount.findOne({ name: loginUsername });

    return res.status(201).json({
      updatedCurrentUser,
      message: "Exam result updated successfully",
    });
  } else {
    res.status(404).send("User not found");}
} catch (error) {
    console.error("Error update Exam Result:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
}};

// -------------------------------------  exam   module  ----------------------------------

// get exam modes 
exports.getExamModes = async (req, res) => {
  try {
    const examTypeCounts = await ExamBank.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    let examMode = await ExamModes.findOne();
    const examSingleChoiceBankCount = examTypeCounts.find(item => item._id === "Single Choice")?.count||0
    const examMultipleChoiceBankCount = examTypeCounts.find(item => item._id === "Multiple Choice")?.count||0
    const examFillingBlankBankCount = examTypeCounts.find(item => item._id === "Filling Blank")?.count||0
    const examJudgementsBankCount = examTypeCounts.find(item => item._id === "Judgements")?.count||0

    // handle the situations of the teacher delete the question bank and exam modes not updated.
    if(examMode.examSingleChoiceCount>examSingleChoiceBankCount){
      examMode.examSingleChoiceCount=examSingleChoiceBankCount
      await examMode.save();
    }
    if(examMode.examMultipleChoiceCount>examMultipleChoiceBankCount){
      examMode.examMultipleChoiceCount=examMultipleChoiceBankCount
      await examMode.save();
    }
    if(examMode.examFillingBlankCount>examFillingBlankBankCount){
      examMode.examFillingBlankCount=examFillingBlankBankCount
      await examMode.save();
    }
    if(examMode.examJudgementsCount>examFillingBlankBankCount){
      examMode.examJudgementsCount=examFillingBlankBankCount
      await examMode.save();
    }

    // there can't bublic the exam if no questions in the exam modes setting.
    if(examMode.examSingleChoiceCount+examMode.examMultipleChoiceCount+examMode.examJudgementsCount+examMode.examJudgementsCount===0){
      examMode.examAvailable=false
      await examMode.save();
    }

    res.json({
      examModesData: examMode,
      examSingleChoiceBankLengh: examSingleChoiceBankCount,
      examMultipleChoiceBankLengh: examMultipleChoiceBankCount,  
      examFillingBlankBankLengh: examFillingBlankBankCount,  
      examJudgementsBankLengh: examJudgementsBankCount
    });
  } catch (error) {
    console.error('Error fetching exam modes:', error);
    res.status(500).json({ error: 'Failed to fetch exam modes' });
  }
};


// exam mode maintenance (set the exam mode)
exports.updateExamMode = async (req, res) => {
  const {
    examAvailable,
    examName,
    examStartTime,
    examEndTime,
    examTime, 
    examSingleChoiceCount,
    examSingleChoiceScore,
    examMultipleChoiceCount,
    examMultipleChoiceScore,
    examFillingBlankCount,
    examFillingBlankScore,
    examJudgementsCount,
    examJudgementsScore,
    examStudentGradesVisible,
    examStudentAnswerVisible
  } = req.body;

  try {
    let examMode = await ExamModes.findOne();

    if (!examMode) {
      return res.status(404).json({ message: "Exam mode not found" });
    }

    // Update the fields
    examMode.examAvailable = examAvailable;
    examMode.examName = examName;
    examMode.examStartTime = examStartTime;
    examMode.examEndTime = examEndTime;
    examMode.examTime = examTime;
    examMode.examSingleChoiceCount = examSingleChoiceCount;
    examMode.examSingleChoiceScore = examSingleChoiceScore;
    examMode.examMultipleChoiceCount = examMultipleChoiceCount;
    examMode.examMultipleChoiceScore = examMultipleChoiceScore;
    examMode.examFillingBlankCount = examFillingBlankCount;
    examMode.examFillingBlankScore = examFillingBlankScore;
    examMode.examJudgementsCount = examJudgementsCount;
    examMode.examJudgementsScore = examJudgementsScore;
    examMode.examStudentGradesVisible = examStudentGradesVisible;
    examMode.examStudentAnswerVisible = examStudentAnswerVisible;

    await examMode.save();

    return res.status(200).json({
      message: `Exam mode has been updated successfully.`,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// send questions if start to exam (prepare the questions for the exam)
exports.getExamPaperQuestion = async (req, res) => {
    let { username } = req.body;
  try {
    // Find the user
    const loginUser = await UserAccount.findOne({ name: username });
    if (!loginUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Push 0 to user's exam grades list
    loginUser.examGradesList.push(0);
    await loginUser.save();

    // Fetch exam questions and settings
    const examBank = await ExamBank.find(); // Get all questions
    const examModes = await ExamModes.findOne(); // Get exam settings

    if (!examModes) {
      return res.status(404).json({ message: "Exam settings not found" });
    }

    // Shuffle and filter questions
    const singleChoiceBank = _.shuffle(examBank.filter(q => q.type === "Single Choice"));
    const multipleChoiceBank = _.shuffle(examBank.filter(q => q.type === "Multiple Choice"));
    const fillingBlankBank = _.shuffle(examBank.filter(q => q.type === "Filling Blank"));
    const judgementsBank = _.shuffle(examBank.filter(q => q.type === "Judgements"));

    // Select questions based on exam settings
    const selectedQuestions = [
      ...(examModes.examSingleChoiceCount > 0 ? singleChoiceBank.slice(0, examModes.examSingleChoiceCount) : []),
      ...(examModes.examMultipleChoiceCount > 0 ? multipleChoiceBank.slice(0, examModes.examMultipleChoiceCount) : []),
      ...(examModes.examFillingBlankCount > 0 ? fillingBlankBank.slice(0, examModes.examFillingBlankCount) : []),
      ...(examModes.examJudgementsCount > 0 ? judgementsBank.slice(0, examModes.examJudgementsCount) : []),
    ];

    // Shuffle final selected questions
    const shuffledQuestions = _.shuffle(selectedQuestions);

    return res.status(200).json({
      message: "The exam questions have been sent",
      examPaperQuestions: shuffledQuestions,
    });

  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// delete single user's grades
exports.deleteUserGrades = async (req, res) => {
  const { userName } = req.body;
  try{
  // select the account if user exists and response
  const selectedUser = await UserAccount.findOne({ name: userName });

  // delete the users' grades
  selectedUser.examGradesList = [];
  selectedUser.examAttemptList = [];
  await selectedUser.save()

  const updatedUserAccount = await UserAccount.find()

  res.status(200).json({
    message: `${userName}'s grades has been deleted successfully.`,
    updatedUserAccount,
  })} catch (error) {
    console.error("Error delete grades:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
}};


// view click User Detail Result (exam socre list view / student view)
exports.viewUserDetailResult = async (req, res) => {
  const { userName } = req.body;
  try{
  // Calculate total score
  const examModes = await ExamModes.findOne()
  const totalScore =  (
    examModes.examSingleChoiceCount * examModes.examSingleChoiceScore +
    examModes.examMultipleChoiceCount * examModes.examMultipleChoiceScore +
    examModes.examFillingBlankCount * examModes.examFillingBlankScore +
    examModes.examJudgementsCount * examModes.examJudgementsScore
  );

  // Find select user
  const selectedUser = await UserAccount.findOne({name : userName});

  if (!selectedUser || !selectedUser.examAttemptList.length || !selectedUser.examAttemptList.length) {
    return res.status(404).json({
      message: `No exam results found for ${userName}.`
    });
  }

  // Get the first attempt
  let attempts = selectedUser.examAttemptList[0];
  const qIDList = attempts.map(attempt => attempt.qID);

  // Find the corresponding questions
  let examPaperQuestions = await ExamBank.find({ id: { $in: qIDList } })

  // Calculate exam score
  let examScore = selectedUser.examGradesList[0]

  res.status(200).json({
    examPaperQuestions,
    attempts,
    totalScore,
    examScore,
    message: `${userName}'s grades have been posted successfully.`,
  })} catch (error) {
    console.error("Error delete grades:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
}};


// clear all grades and post new user account (exam socre list)
exports.deleteAllUserGrades = async (req, res) => {
  try {
    // Update all users in the database
    await UserAccount.updateMany({}, { 
      examGradesList: [], 
      examAttemptList: [] 
    });
    const updatedUserAccount = await UserAccount.find()
    res.json({
      message: "All users' grades have been cleared successfully.",
      updatedUserAccount
    });

  } catch (error) {
    console.error("Error clearing user grades:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

