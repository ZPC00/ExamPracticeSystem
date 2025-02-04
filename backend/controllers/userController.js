let userAccount = require('../data/userAccount');
let practiceBank = require('../data/practiceBank');

// account management
// 获取所有用户账户
exports.getUserAccounts = (req, res) => {
  res.json(userAccount);
};

// 删除用户
exports.deleteUser = (req, res) => {
  const { userName } = req.body;

  const userExists = userAccount.some(user => user.name === userName);
  if (!userExists) {
    return res.status(404).json({ error: `User "${userName}" not found.` });
  }

  userAccount = userAccount.filter(user => user.name !== userName);
  res.status(200).json({
    message: `User "${userName}" has been deleted successfully.`,
    updatedUserAccount: userAccount,
  });
};

// user account maintance
exports.saveUser = (req, res) => {
  let { id, name, password, Loginrole, firstname, lastname, email } = req.body;

  if (id) {
    // update user
    const selectedUser = userAccount.find(user => user.id === id);

    if (!selectedUser) {
      return res.status(404).json({ error: `User with ID "${id}" not found.` });
    }

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
    // add user
  } else {
    const maxId = Math.max(...userAccount.map(user => parseInt(user.id, 10)), 0);
    const newId = (maxId + 1).toString().padStart(8, '0');
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
    userAccount.push(newUser);
    return res.status(201).json({
      message: `User "${name}" added successfully.`,
      updatedUserAccount: userAccount,
    });
  }
};

exports.updatePassword = (req, res) => {
  let { id, oldPassword, newPassword1, newPassword2} = req.body;

    const selectedUser = userAccount.find(user => user.id === id);

    if (!selectedUser) {
      return res.status(404).json({ error: `User with ID "${id}" not found.` });
    }

    Object.assign(selectedUser, {
      password: newPassword1
    });

    return res.status(200).json({
      message: `Password has been updated successfully.`,
      updatedUserAccount: userAccount,
    });
};


// practice bank 
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

  practiceBank = practiceBank.filter(practiceQ => practiceQ.id !== id);
  res.status(200).json({
    message: `The Practice Question which id="${id}" has been deleted successfully.`,
    updatedPracticeQuestion: practiceBank,
  });
};

// user Question mantice
exports.savePracticeQusetion = (req, res) => {
  let { id, type, Question, A, B, C, D, E, correctAnswer,description } = req.body;

  if (id) {
    // update Question
    const selectedQuestion = practiceBank.find(q => q.id === id);

    if (!selectedQuestion) {
      return res.status(404).json({ error: `Question with ID "${id}" not found.` });
    }

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
    // add question
  } else {
    const maxId = Math.max(...practiceBank.map(question => parseInt(question.id, 10)), 0);
    const newId = (maxId + 1).toString().padStart(8, '0');
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