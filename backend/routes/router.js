const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/userAccount', userController.getUserAccounts);
router.post('/deleteUser', userController.deleteUser);
router.post('/saveUser', userController.saveUser);
router.post('/updatePassword', userController.updatePassword);
router.get('/getPracticeBank', userController.getPracticeBank);
router.post('/deletePracticeQuestion', userController.deletePracticeQuestion);
router.post('/savePracticeQusetion', userController.savePracticeQusetion);


module.exports = router;
