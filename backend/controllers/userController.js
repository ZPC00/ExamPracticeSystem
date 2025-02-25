const _ = require('lodash');
let userAccount = require('../data/userAccount');
let practiceBank = require('../data/practiceBank');
let examBank = require('../data/examBank');
let examModes = require('../data/examModes');

// ----------------  account management module  -------------------------

// get all user account list
exports.getUserAccounts = (req, res) => {
  res.json(userAccount);
};

// delete user account
exports.deleteUser = (req, res) => {
  const { userName } = req.body;
  
  // check user exists
  const userExists = userAccount.some(user => user.name === userName);
  if (!userExists) {
    return res.status(404).json({ error: `User "${userName}" not found.` });
  }
  // delete the account if user exists and response
  userAccount = userAccount.filter(user => user.name !== userName);
  res.status(200).json({
    message: `User "${userName}" has been deleted successfully.`,
    updatedUserAccount: userAccount,
  });
};

// User account maintenance
exports.saveUser = (req, res) => {
  let { id, name, password, Loginrole, firstname, lastname, email } = req.body;

  if (id) {
    // update user if user id exsit
    const selectedUser = userAccount.find(user => user.id === id);

    if (!selectedUser) {
      return res.status(404).json({ error: `User with ID "${id}" not found.` });
    }
    
    // update the change value
    Object.assign(selectedUser, {
      name,
      firstname,
      lastname,
      password,
      Loginrole,
      email,
    });

    return res.status(200).json({
      message: `User "${name}" has been updated successfully.`,
      updatedUserAccount: userAccount,
    });

    // add user if user id not exsit
  } else {
    // generate a new id
    const maxId = Math.max(...userAccount.map(user => parseInt(user.id, 10)), 0);
    const newId = (maxId + 1).toString().padStart(8, '0');

    // pack new user data
    const newUser = {
      id: newId,
      name,
      firstname,
      lastname,
      password,
      Loginrole,
      email,
      practiceGradesList: [],
      examGradesList: [],
    };
    // push to update the user
    userAccount.push(newUser);
    return res.status(201).json({
      message: `User "${name}" added successfully.`,
      updatedUserAccount: userAccount,
    });
  }
};

//update the users' password

exports.updatePassword = (req, res) => {
  let { id, oldPassword, newPassword1, newPassword2} = req.body;

    const selectedUser = userAccount.find(user => user.id === id);

    if (!selectedUser) {
      return res.status(404).json({ error: `User with ID "${id}" not found.` });
    }

    // update the user's password
    Object.assign(selectedUser, {
      password: newPassword1
    });

    return res.status(200).json({
      message: `Password has been updated successfully.`,
      updatedUserAccount: userAccount,
    });
};

// ----------------  practice bank module  -------------------------

// get practice bank list
exports.getPracticeBank = (req, res) => {
  res.json(practiceBank);
};

// delete question
exports.deletePracticeQuestion = (req, res) => {
  const { id } = req.body;

  const practiceQuestionExsit = practiceBank.some(practiceQ => practiceQ.id === id);
  if (!practiceQuestionExsit) {
    return res.status(404).json({ error: `Question id="${id}" not found.` });
  }
  // delete the question if the question exsit
  practiceBank = practiceBank.filter(practiceQ => practiceQ.id !== id);
  res.status(200).json({
    message: `The Practice Question which id="${id}" has been deleted successfully.`,
    updatedPracticeQuestion: practiceBank,
  });
};

// practice bank question maintenance
exports.savePracticeQusetion = (req, res) => {
  let { id, type, Question, A, B, C, D, E, correctAnswer,description } = req.body;

  // update Question if the id exsit
  if (id) {
    const selectedQuestion = practiceBank.find(q => q.id === id);

    if (!selectedQuestion) {
      return res.status(404).json({ error: `Question with ID "${id}" not found.` });
    }

    // update the quesiton information
    Object.assign(selectedQuestion, {
      type,
      Question,
      A,
      B,
      C,
      D,
      E,
      correctAnswer,
      description
    });

    return res.status(200).json({
      message: `Question with id="${id}" has been updated successfully.`,
      updatedPracticeQuestion: practiceBank,
    });

    // add question if the id is not exsit
  } else {
    // gernerate new quesiton id
    const maxId = Math.max(...practiceBank.map(question => parseInt(question.id, 10)), 0);
    const newId = (maxId + 1).toString().padStart(8, '0');

    // pack question date to add the questions
    const newQuestion = {
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
      inCorrectCount: 0,
    };
    practiceBank.push(newQuestion);
    return res.status(201).json({
      message: `Question with id="${newId}" added successfully.`,
      updatedPracticeQuestion: practiceBank,
    });
  }
};

// add the question by uploading the excel
exports.excelPracticeUpdate = (req, res) => {
  const updateQ = req.body;

  // find out max id
  let currentMaxId = Math.max(...practiceBank.map(question => parseInt(question.id, 10)), 0);

  const newQuestions = updateQ.map(question => {
    currentMaxId++;                                          // define id add 1 each time
    const newId = currentMaxId.toString().padStart(8, '0'); // gernerate the new id for each question
    
    // pack each add question to add questions to practice bank
    const { type, Question, A, B, C, D, E, correctAnswer, description } = question;
    return {
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
      inCorrectCount: 0,
    };
  });

  // push each question to practiceBank
  practiceBank.push(...newQuestions);

  return res.status(201).json({
    message: `Add ${updateQ.length} questions successfully.`,
    updatedPracticeQuestion: practiceBank,
  });
};


  // update Practice mock exam Result
  exports.updatePracticeResult = (req, res) => {
    let { loginUsername, practiceScore, IncorrectQList } = req.body;

    console.log("Received request body:", req.body);

    const selectedUser = userAccount.find(user => user.name === loginUsername);
    if (selectedUser) {
      // Update the Grade information by adding the practiceScore
      selectedUser.practiceGradesList.push(practiceScore);

      // Iterate over IncorrectQList and update inCorrectCount
      IncorrectQList.forEach(qID => {
        practiceBank.forEach(q => {
          if (q.id === qID) {
            q.inCorrectCount += 1;
          }
        });
      });
      
      return res.status(201).json({
        message: "Practice result updated successfully",
        updatedPracticeQuestion: practiceBank,
        updatedUserAccount:userAccount
      });
    } else {
      res.status(404).send("User not found");
    }
  };

  // ----------------  exam bank module  -------------------------

// get exam bank list
exports.getExamBank = (req, res) => {
  res.json(examBank);
};

// delete question
exports.deleteExamQuestion = (req, res) => {
  const { id } = req.body;

  const examQuestionExsit = examBank.some(examQ => examQ.id === id);
  if (!examQuestionExsit) {
    return res.status(404).json({ error: `Question id="${id}" not found.` });
  }
  // delete the question if the question exsit
  examBank = examBank.filter(examQ => examQ.id !== id);
  res.status(200).json({
    message: `The Exam Question which id="${id}" has been deleted successfully.`,
    updatedExamQuestion: examBank,
  });
};

// Exam bank question maintenance
exports.saveExamQusetion = (req, res) => {
  let { id, type, Question, A, B, C, D, E, correctAnswer,description } = req.body;

  // update Question if the id exsit
  if (id) {
    const selectedQuestion = examBank.find(q => q.id === id);

    if (!selectedQuestion) {
      return res.status(404).json({ error: `Question with ID "${id}" not found.` });
    }

    // update the quesiton information
    Object.assign(selectedQuestion, {
      type,
      Question,
      A,
      B,
      C,
      D,
      E,
      correctAnswer,
      description
    });

    return res.status(200).json({
      message: `Question with id="${id}" has been updated successfully.`,
      updatedExamQuestion: examBank,
    });

    // add question if the id is not exsit
  } else {
    // gernerate new quesiton id
    const maxId = Math.max(...examBank.map(question => parseInt(question.id, 10)), 0);
    const newId = (maxId + 1).toString().padStart(8, '0');

    // pack question date to add the questions
    const newQuestion = {
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
      inCorrectCount: 0,
    };
    examBank.push(newQuestion);
    return res.status(201).json({
      message: `Question with id="${newId}" added successfully.`,
      updatedExamQuestion: examBank,
    });
  }
};

// add the question by uploading the excel
exports.excelExamUpdate = (req, res) => {
  const updateQ = req.body;

  // find out max id
  let currentMaxId = Math.max(...examBank.map(question => parseInt(question.id, 10)), 0);

  const newQuestions = updateQ.map(question => {
    currentMaxId++;                                          // define id add 1 each time
    const newId = currentMaxId.toString().padStart(8, '0'); // gernerate the new id for each question
    
    // pack each add question to add questions to Exam bank
    const { type, Question, A, B, C, D, E, correctAnswer, description } = question;
    return {
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
      inCorrectCount: 0,
    };
  });

  // push each question to examBank
  examBank.push(...newQuestions);

  return res.status(201).json({
    message: `Add ${updateQ.length} questions successfully.`,
    updatedExamQuestion: examBank,
  });
};


  // update Exam mock exam Result
  exports.updateExamResult = (req, res) => {
    let { loginUsername, examScore, IncorrectQList } = req.body;

    console.log("Received request body:", req.body);

    const selectedUser = userAccount.find(user => user.name === loginUsername);
    if (selectedUser) {
      // Update the Grade information by adding the examScore
      selectedUser.practiceGradesList.push(examScore);

      // Iterate over IncorrectQList and update inCorrectCount
      IncorrectQList.forEach(qID => {
        examBank.forEach(q => {
          if (q.id === qID) {
            q.inCorrectCount += 1;
          }
        });
      });
      
      return res.status(201).json({
        message: "Exam result updated successfully",
        updatedExamQuestion: examBank,
        updatedUserAccount:userAccount
      });
    } else {
      res.status(404).send("User not found");
    }
  };

// get exam modes 
exports.getExamModes = (req, res) => {
  const examSingleChoiceBank = examBank.filter(q => q.type === "Single Choice");
  const examMultipleChoiceBank = examBank.filter(q => q.type === "Multiple Choice");
  const examFillingBlankBank = examBank.filter(q => q.type === "Filling Blank");
  const examJudgementsBank = examBank.filter(q => q.type === "Judgements");

  res.json({
      examModesData: examModes,
      examSingleChoiceBankLengh: examSingleChoiceBank.length,
      examMultipleChoiceBankLengh: examMultipleChoiceBank.length,  
      examFillingBlankBankLengh: examFillingBlankBank.length,  
      examJudgementsBankLengh: examJudgementsBank.length  
  });
};



// exam mode maintenance
exports.updateExamMode = (req, res) => {
  let { examAvailable,
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
    examStudentAnswerVisible } = req.body;

    Object.assign(examModes, {
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
    });

    return res.status(200).json({
      message: `Exam Modes has been updated successfully.`,
      updatedExamModes: examModes,
    });};
  


exports.getExamPaperQuestion = (req, res) => {
  let { username } = req.body;
  const loginUsername = userAccount.find(user => user.name === username);
  loginUsername.examGradesList.push(0);

  const singleChoiceBank = _.shuffle(examBank.filter(q => q.type === "Single Choice"))
  const multipleChoiceBank = _.shuffle(examBank.filter(q => q.type === "Multiple Choice"))
  const fillingBlankBank = _.shuffle(examBank.filter(q => q.type === "Filling Blank"))
  const judgementsBank = _.shuffle(examBank.filter(q => q.type === "Judgements"))

  const selectedQuestions = [
    ...(examModes.examSingleChoiceCount > 0 ? singleChoiceBank.slice(0, examModes.examSingleChoiceCount) : []),
    ...(examModes.examMultipleChoiceCount > 0 ? multipleChoiceBank.slice(0, examModes.examMultipleChoiceCount) : []),
    ...(examModes.examFillingBlankCount > 0 ? fillingBlankBank.slice(0, examModes.examFillingBlankCount) : []),
    ...(examModes.examJudgementsCount > 0 ? judgementsBank.slice(0, examModes.examJudgementsCount) : []),
  ]
  const shuffledQuestions = _.shuffle(selectedQuestions)

  return res.status(200).json({
    message: `The exam question has been post`,
    examPaperQuestions : shuffledQuestions,
  });}

    // update Exam mock exam Result
    exports.updateExamResult = (req, res) => {
      let { loginUsername, examScore, IncorrectQList, userAttempt } = req.body;
  
      const currentUser = userAccount.find(user => user.name === loginUsername);
      if (currentUser) {
        // Update the Grade information by adding the examScore
        currentUser.examGradesList[currentUser.examGradesList.length - 1] = examScore;
        currentUser.examAttemptList.push(userAttempt)
  
        // Iterate over IncorrectQList and update inCorrectCount
        IncorrectQList.forEach(qID => {
          examBank.forEach(q => {
            if (q.id === qID) {
              q.inCorrectCount += 1;
            }
          });
        });
        
        return res.status(201).json({
          updateUserAccount:userAccount,
          message: "Exam result updated successfully",
        });
      } else {
        res.status(404).send("User not found");
      }
    };

// delete user's grades
exports.deleteUserGrades = (req, res) => {
  const { userName } = req.body;
  // select the account if user exists and response
  selectedUser = userAccount.find(user => user.name === userName);
  
  // delete the users' grades
  Object.assign(selectedUser, {
    examGradesList:[],
    examAttemptList:[]
  });
  res.status(200).json({
    message: `${userName}'s grades has been deleted successfully.`,
    updatedUserAccount: userAccount,
  });
};

// view User Detail Result
exports.viewUserDetailResult = (req, res) => {
  const { userName } = req.body;

  // Calculate total score
  const totalScore = (
    examModes.examSingleChoiceCount * examModes.examSingleChoiceScore +
    examModes.examMultipleChoiceCount * examModes.examMultipleChoiceScore +
    examModes.examFillingBlankCount * examModes.examFillingBlankScore +
    examModes.examJudgementsCount * examModes.examJudgementsScore
  );

  // Find user
  const selectedUser = userAccount.find(user => user.name === userName);

  if (!selectedUser || !selectedUser.examAttemptList.length || !selectedUser.examAttemptList.length) {
    return res.status(404).json({
      message: `No exam results found for ${userName}.`
    });
  }

  // Get the first attempt
  let attempts = selectedUser.examAttemptList[0];

  // Find the corresponding questions
  let examPaperQuestions = examBank.filter(question =>
    attempts.some(attemptAnswer => attemptAnswer.qID === question.id)
  );

  // Calculate exam score
  let examScore = selectedUser.examGradesList[0]

  res.status(200).json({
    examPaperQuestions: examPaperQuestions,
    attempts: attempts,
    totalScore: totalScore,
    examScore: examScore,
    message: `${userName}'s grades have been posted successfully.`,
  });
};

// clear all grades and post new user account
exports.deleteAllUserGrades = (req, res) => {
  userAccount.forEach(user => {
      user.examGradesList = [];
      user.examAttemptList = [];
  });
  res.json({
    message: "All users' grades have been cleered.",
    updatedUserAccount: userAccount});
};

