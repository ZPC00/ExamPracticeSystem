let userAccount = require('../data/userAccount');

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