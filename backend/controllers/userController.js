let userAccount = require('../data/userAccount');
let practiceBank = require('../data/practiceBank');

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
      Grade: [],
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
      selectedUser.Grade.push(practiceScore);

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
  





