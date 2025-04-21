const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/userAccount', userController.getUserAccounts);
router.post('/login', userController.login);
router.post('/deleteUser', userController.deleteUser);
router.post('/saveUser', userController.saveUser);
router.post('/updatePassword', userController.updatePassword);
router.post('/matchUserInfo', userController.matchUserInfo);


router.get('/getPracticeBank', userController.getPracticeBank);
router.post('/deletePracticeQuestion', userController.deletePracticeQuestion);
router.post('/savePracticeQusetion', userController.savePracticeQusetion);
router.post('/excelPracticeUpdate', userController.excelPracticeUpdate);
router.post('/updatePracticeResult', userController.updatePracticeResult);


router.get('/getExamBank', userController.getExamBank);
router.post('/deleteExamQuestion', userController.deleteExamQuestion);
router.post('/saveExamQusetion', userController.saveExamQusetion);
router.post('/excelExamUpdate', userController.excelExamUpdate);
router.post('/updateExamResult', userController.updateExamResult);


router.get('/getExamModes', userController.getExamModes);
router.post('/updateExamMode', userController.updateExamMode);
router.post('/getExamPaperQuestion', userController.getExamPaperQuestion);
router.post('/deleteUserGrades', userController.deleteUserGrades);
router.post('/viewUserDetailResult', userController.viewUserDetailResult);


router.get('/deleteAllUserGrades', userController.deleteAllUserGrades);

router.get('/', (req, res) => {
    res.send('The practice exam system backend server is running!');
  });

module.exports = router;
