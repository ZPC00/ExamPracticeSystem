const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/userAccount', userController.getUserAccounts);
router.post('/deleteUser', userController.deleteUser);
router.post('/saveUser', userController.saveUser);
router.post('/updatePassword', userController.updatePassword);



module.exports = router;
