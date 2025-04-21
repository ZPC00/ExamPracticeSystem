import React, { useState, useContext,useEffect } from "react";
import { AppContext } from "../AppContext";
import {Button, Checkbox, TextField, FormControlLabel, Radio, RadioGroup, Typography, Stack, Dialog, DialogContent, DialogActions} from "@mui/material";
import axios from 'axios';
import _ from "lodash"
import ExamResult from "../GradesView/ExamResult"


function Exam() {

  const { username,setfuncts,examRuningState, setExamRuningState, currentUserInfor, setCurrentUserInfor} = useContext(AppContext);

  // state for change homepage
  const [randomOptions, setRandomOptions] = useState([]);

  // state for filter question bank
  const [examPaperQuestions, setExamPaperQuestions] = useState([]);
  const [examModes, setExamModes] = useState({});
  const [submitted, setSubmitted] = useState(false);               // set for the prevent not to submit twice

  // state for the process of exam
  const [userAnswer, setUserAnswer] = useState("");
  const [showSubmitBottun, setShowSubmitBottun] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(examModes.examTime * 60); // Timer in seconds
  const [attempts, setAttempts] = useState([]);                // store relative inoformation of the users' answer
  const currentQuestion = examPaperQuestions[currentIndex];

  // set for view the detailed of the exam result if the user have taken the exam.
  const [getTotalScore,setGetTotalScore] = useState(null);
  const [examScore, setExamScore] = useState(null);
  const [openUserResult,setOpenUserResult]= useState(false);
  
  // set for the home page of the exam page and view the Exam Description
  const totalScore = (examModes.examSingleChoiceCount*examModes.examSingleChoiceScore+                // caculate total score
    examModes.examMultipleChoiceCount*examModes.examMultipleChoiceScore+examModes.examFillingBlankCount*examModes.examFillingBlankScore+examModes.examJudgementsCount*examModes.examJudgementsScore)
  
  // Set exam timer to avoid the impact of asynchronous excution
  useEffect(() => {
    setTimer(examModes.examTime * 60); // Update timer based on exam Time (in minutes)
  }, [examModes.examTime]);

  // Timer logic
  useEffect(() => {
    let countdown;
    if (examRuningState && timer > 0) {
      countdown = setInterval(() => {
        setTimer(time => {
          if (time <= 1) {
            clearInterval(countdown);
            handleSubmitExam();     // Submit the exam when time is up
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdown);
    }

    return () => clearInterval(countdown); // Clean up on unmount or timer change
    // eslint-disable-next-line 
  }, [examRuningState, timer]);

    // listen for currentIndex changes, randomize the order of options
    useEffect(() => {
      if (currentQuestion && (currentQuestion.type === "Single Choice" || currentQuestion.type === "Multiple Choice")) {
        const randomOptionList = _.shuffle(["A", "B", "C", "D", "E"]); // randomize the order of options
        setRandomOptions(randomOptionList);
      }                          
  }, [currentIndex, currentQuestion]); // listen for current index, current qustion changes

  // load the exam mode from back end
  useEffect(() => {
    axios.get('https://exampracticesystem-backend.onrender.com/getExamModes')
        .then(response => {
          setExamModes(response.data.examModesData);
          })
        .catch(error => {
          console.error('Error fetching product data:', error);
      });
  }, []);

  // check exam time available and control the aviliable of the start time button
  const [examTimeInRange, setIsExamTimeInRange] = useState(false);

  useEffect(() => {
    const checkTimeRange = () => {
      const currentTime = new Date();
      const examStartTime = new Date(examModes.examStartTime);
      const examEndTime = new Date(examModes.examEndTime);
      setIsExamTimeInRange(currentTime >= examStartTime && currentTime <= examEndTime);
    };
    const interval = setInterval(checkTimeRange, 1000);    //check every second
    checkTimeRange();
    return () => clearInterval(interval);
  }, [examModes.examStartTime, examModes.examEndTime]);


  // the function for handle submit each user's question
  const handleSubmitUserAnswer = (QuestionType) => {
    let handleUserAnswer = userAnswer;
    let handleCorrectAnswer = currentQuestion.correctAnswer;
    
    // sort the correct answer letters to compare the correctness of the questions it its type is Choice
    if (QuestionType === "Single Choice" || QuestionType === "Multiple Choice") {
      handleUserAnswer = userAnswer.split("").sort().join("").toUpperCase();
      handleCorrectAnswer = currentQuestion.correctAnswer.split("").sort().join("").toUpperCase();
    }
    
    // define the correctness of users' answers and set its socres
    const correctness = handleUserAnswer === handleCorrectAnswer;
    let currentQuestionScore =0
    if (QuestionType === "Single Choice" && correctness){
      currentQuestionScore = examModes.examSingleChoiceScore
    }
    if (QuestionType === "Multiple Choice" && correctness){
      currentQuestionScore = examModes.examMultipleChoiceScore
    }
    if (QuestionType === "Filling Blank" && correctness){
      currentQuestionScore = examModes.examFillingBlankScore
    }
    if (QuestionType === "Judgements" && correctness){
      currentQuestionScore = examModes.examJudgementsScore
    }

    //store the user's answer to review
    setAttempts(prev => {
      const updatedAttempts = [...prev];
      updatedAttempts[currentIndex] = { qID:currentQuestion.id ,userAnswer: userAnswer, correctness, score:currentQuestionScore};
      return updatedAttempts;
    });
  };
  
  // the function to deal jump to target quesstion
  const handleJumpToQuestion = (index) => {
    setCurrentIndex(index);
    setShowSubmitBottun(false)

    // dispaly the result if has answered the question
    if (attempts[index]) {
      setUserAnswer(attempts[index].userAnswer);
    } else {
      setUserAnswer("");
    }
  };
  
  // the function to deal next button
  const handleNext = () => {
    handleSubmitUserAnswer(currentQuestion.type)
    const nextIndex = (currentIndex + 1) % examPaperQuestions.length;    // if the last question jump to the first one
    if(nextIndex === 0 ){
      setShowSubmitBottun(true)
    }else{
      handleJumpToQuestion(nextIndex);
    }
  };

  
// the function to submit the exam
const handleSubmitExam = async () => {
  if (submitted) return; // check submitted to avoid submitting twice
    setSubmitted(true);
  
  // Calculate Exam Score and Incorrect Questions List
  const examScore = attempts.reduce((total, a) => total + a.score, 0);
  const IncorrectQIDList = attempts.filter((a) => !a.correctness).map((a) => a.qID);

  const newExamResultInfo = {
    loginUsername: username,
    examScore: examScore,
    IncorrectQList: IncorrectQIDList,
    userAttempt:attempts
  };

  // Send the exam result to the back end.
  axios
    .post("https://exampracticesystem-backend.onrender.com/updateExamResult", newExamResultInfo)
    .then((response) => {
      setExamRuningState(false);
      console.log(response)
      setCurrentUserInfor(response.data.updatedCurrentUser);
      setfuncts(<ExamResult examStudentGradesVisible={examModes.examStudentGradesVisible} examStudentAnswerVisible={examModes.examStudentAnswerVisible} 
        examPaperQuestions={examPaperQuestions} attempts={attempts} examScore={examScore} totalScore={totalScore}/>)
    })
    .catch((error) => {
      console.error("UpdateError", error);
    });
  };

  // the function to review the exam questions and start to exam
  const startExam = () => {
  if (window.confirm("The exam can't be suspended during the process, are you sure?")){
  axios.post('https://exampracticesystem-backend.onrender.com/getExamPaperQuestion',{username})
       .then(response => {
        setExamPaperQuestions(response.data.examPaperQuestions);
        const initializationAttempts = response.data.examPaperQuestions.map((question) => ({
          qID: question.id,
          userAnswer: "",
          correctness: false,
          score: 0,
        }));
        setAttempts(initializationAttempts);
        setSubmitted(false);
        setExamRuningState(true);
      })
      .catch(error => {
        console.error('Error fetching exam questions:', error);
      });
}};

// the function to view the detailed users' answers if the user have taken the exam.
const handleViewUserResult = (userName)=>{
  axios
    .post('https://exampracticesystem-backend.onrender.com/viewUserDetailResult', { userName })
    .then((response) => {
      setExamPaperQuestions(response.data.examPaperQuestions)
      setAttempts(response.data.attempts)
      setExamScore(response.data.examScore)
      setGetTotalScore(response.data.totalScore)
      setOpenUserResult(true)
    })
    .catch((error) => {
      console.error('Error deleting user:', error);
    });
  }

  return examModes.examAvailable ?
  // check exam aviabiable?
  (currentUserInfor.examGradesList.length !== 0 ? (
    
  // Situation 1： the user have taken the exam to display the grades
  <div>
    <h1 style={{ color: "#1976D2", textAlign: "center", marginTop: "30px"}}>Welcome to Exam System</h1>
    <h2 style={{ textAlign: "left", marginTop: "60px",  marginLeft:"20px"  }}>Here is the current exam notice:</h2>

    <div style={{  textAlign: "left", marginTop: "50px", display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
      <h3>Exam Name:</h3>
      <h3 style={{ marginLeft: "20px" }}>
         {examModes.examName}
      </h3>
    </div>

    <div style={{  textAlign: "left", display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
      <h3>Examination Validity Time:</h3>
      <h3 style={{ marginLeft: "20px" }}>
        {new Date(examModes.examStartTime).toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}   ~     {new Date(examModes.examEndTime).toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}
      </h3>
    </div>

    <div style={{  textAlign: "left",  display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
    <h3>Exam Time:</h3>
    <h3 style={{marginLeft:"20px"}}>{examModes.examTime} min</h3>
    </div>

    <div style={{  textAlign: "left", marginTop: "10px", display: 'flex', alignItems: 'center', marginLeft:"20px",marginRight:"60px" }}>
      <h3 style={{width:"900px"}}>Exam Description:</h3>
      <h3 style={{marginLeft:"20px"}}> There are {examModes.examSingleChoiceCount} single choices, {examModes.examMultipleChoiceCount} multiple choices, {examModes.examFillingBlankCount} filling 
        blank, {examModes.examJudgementsCount} judgements questions in this exam. All the quesitons and options will be dispalyed randomly. The total score is {totalScore}.
        The score for each single choice question is {examModes.examSingleChoiceScore}, each multiple choice question is {examModes.examMultipleChoiceScore}, each filling blank quesiton is {examModes.examFillingBlankScore},
        each judgement quesiton is {examModes.examJudgementsScore}. There only have one chance to take the exam, once you have started the exam, it can't be suspend or exit until you finish it. If you have prepared for the exam, press
        the start exam button to start when it available. 
      </h3> 
    </div>
    
    {/*submit button to view the detailed of the exam result*/}
    <Button underline style={{marginTop: "100px", marginBottom: "100px", color: "#1976D2", fontSize: "2rem",fontWeight: "bold",textDecoration: "underline"}} 
    onClick={() => {if(currentUserInfor.examAttemptList.length>0){handleViewUserResult(currentUserInfor.name)}else{alert("There is no answers records, you may have suspended the exam during the process of the exam.")}}}>  {/*Check the users' answer list*/}
      You have taken the exam and the result has been submitted.
    </Button>

    <Dialog open={openUserResult} onClose={() => setOpenUserResult(false)} maxWidth="lg" fullWidth>
          <DialogContent sx={{ minWidth: "1000px", p:4}}>
          <ExamResult examStudentGradesVisible={examModes.examStudentGradesVisible} examStudentAnswerVisible={examModes.examStudentAnswerVisible} 
              examPaperQuestions={examPaperQuestions} attempts={attempts} examScore={examScore} totalScore={getTotalScore}/>
          </DialogContent>
        <DialogActions>
           <Button onClick={() => { setOpenUserResult(false)}}>Cancel</Button>
       </DialogActions>
     </Dialog>

  </div>
  ) : (
  !examRuningState ? 
// Situation 2： the user doesn't take the exam
// dispaly the exam description  
 (<div>
    <h1 style={{ color: "#1976D2", textAlign: "center", marginTop: "30px"}}>Welcome to the Exam System</h1>
    <h2 style={{ textAlign: "left", marginTop: "60px",  marginLeft:"20px"  }}>Here is the current exam notice:</h2>

    <div style={{  textAlign: "left", marginTop: "50px", display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
      <h3>Exam Name:</h3>
      <h3 style={{ marginLeft: "20px" }}>
         {examModes.examName}
      </h3>
    </div>

    <div style={{  textAlign: "left", display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
      <h3>Examination Validity Time:</h3>
      <h3 style={{ marginLeft: "20px" }}>
        {new Date(examModes.examStartTime).toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}   ~     {new Date(examModes.examEndTime).toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}
      </h3>
    </div>

    <div style={{  textAlign: "left",  display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
    <h3>Exam Time:</h3>
    <h3 style={{marginLeft:"20px"}}>{examModes.examTime} min</h3>
    </div>

    <div style={{  textAlign: "left",  display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
    <h3>Total Score:</h3>
    <h3 style={{marginLeft:"20px"}}>{totalScore}</h3>
    </div>

    <div style={{  textAlign: "left", marginTop: "10px", display: 'flex', alignItems: 'center', marginLeft:"20px",marginRight:"60px" }}>
      <h3 style={{width:"900px"}}>Exam Description:</h3>
      <h3 style={{marginLeft:"20px"}}> There are {examModes.examSingleChoiceCount} single choices, {examModes.examMultipleChoiceCount} multiple choices, {examModes.examFillingBlankCount} filling 
        blank, {examModes.examJudgementsCount} judgements questions in this exam. All the quesitons and options will be dispalyed randomly. 
        The score for each single choice question is {examModes.examSingleChoiceScore}, each multiple choice question is {examModes.examMultipleChoiceScore}, each filling blank quesiton is {examModes.examFillingBlankScore},
        each judgement quesiton is {examModes.examJudgementsScore}. There only have one chance to take the exam, once you have started the exam, it can't be suspend or exit until you finish it. If you have prepared for the exam, press
        the start exam button to start when it available. 
      </h3> 
    </div>
    
    {/*start the exam button：it will disabled if the current time didn't in the examination validity time*/}
    <Button variant="contained" style={{ width: "160px", marginTop: "50px", marginBottom: "90px"}} onClick={() => startExam()} disabled={!examTimeInRange}>
     {examTimeInRange? "Start Exam":"Time Not Available"} 
    </Button>
  </div>)
  :(

  // change to take exam page
  <div>
      {/* Timer Display: the color will turn red if the rest of time is less than 10% of total time */}
      <Typography variant="h5" bold style={{ marginTop: "20px", textAlign: "left", color: timer > examModes.examTime*6 ? "black":"red",fontWeight: "bold"}}>
        Time Left: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </Typography>

    {/*the part of displaying question */}
    <div style={{ display: "flex", gap: "20px", padding: "20px", height: "800px" }}>
      <div style={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          {currentIndex + 1}. {currentQuestion.Question}
        </Typography>
        
        {currentQuestion.image && (
              <div style={{ marginTop: '10px', textAlign: "center" }}>
                <img src={currentQuestion.image} alt="Preview" style={{ maxWidth: '400px', maxHeight: '250px' }} />
              </div>)}

        {/* Single Choice*/}
        {currentQuestion.type === "Single Choice" && (
          <RadioGroup
            value={userAnswer}
            onChange={(e) => {
                setUserAnswer(e.target.value);
                setShowSubmitBottun(false)
              }
            }
          >
            {/*display the optional choice squentially which control by useEffect*/}
            {randomOptions.map(
              (option) =>
                currentQuestion[option] && (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={`${currentQuestion[option]}`} />
                ))}
          </RadioGroup>
        )}

        {/* Multiple Choice */}
        {currentQuestion.type === "Multiple Choice" && (
          <Stack spacing={1}>
            {/*display the optional choice squentially which control by useEffect*/}
            {randomOptions.map(
              (option) =>
                currentQuestion[option] && (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={userAnswer.includes(option)}
                        onChange={(e) => {
                            setUserAnswer((prev) =>
                              e.target.checked ? prev + option : prev.replace(option, "")
                            );
                            setShowSubmitBottun(false)
                          }
                        }
                      />
                    }
                    label={`${currentQuestion[option]}`}
                  />
                )
            )}
          </Stack>
        )}

        {/* Filling Blank */}
        {currentQuestion.type === "Filling Blank" && (
          <TextField
            variant="outlined"
            fullWidth
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              setShowSubmitBottun(false)
            }}
            margin="normal"
          />
        )}

        {/* Judgements */}
        {currentQuestion.type === "Judgements" && (
          <RadioGroup
            value={userAnswer}
            onChange={(e) => {
              // only handle no answered question
                setUserAnswer(e.target.value);
                setShowSubmitBottun(false)
              }
            }
          >
            <FormControlLabel value="True" control={<Radio />} label="True" />
            <FormControlLabel value="False" control={<Radio />} label="False" />
          </RadioGroup>
        )}

        {/* next button, only click the next for the last question to display submit button*/}
        <Button variant="outlined" color="secondary" onClick={() => {
            if (showSubmitBottun) {
              if (window.confirm("Submission can't be rolled back, are you sure?")) {
                handleSubmitExam();                                                      // Call submit exam if confirmed
              }
            } else {
              handleNext();                                                              // Call next if not submitting
            }
            }} style={{ marginTop: "10px", marginLeft: "10px" }}>
            {showSubmitBottun? "Submit" : "Save And Next"}
        </Button>
      </div>

      {/* question index list */}
      <div style={{ borderLeft: "1px solid #ccc", paddingLeft: "10px", maxHeight: "800px", overflowY: "auto" }}>
        <Typography variant="h5">Exam Question List</Typography>
        <br />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>   {/* 5 buttons each line and gap is 10px*/}
          {examPaperQuestions.map((_, index) => (
            <Button
              key={index}
              variant="contained"
              style={{
                backgroundColor: attempts[index] && attempts[index].userAnswer !== "" ? "green" : "#ccc",    // answered green, unanswered light grey
                color: "white",
                padding: "10px",
              }}
              onClick={() => handleJumpToQuestion(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  </div>
))) : (
  
  // Situation 3：the exam is not pubilc
 <div>
  <h1 style={{ color: "#1976D2", textAlign: "center", marginTop: "30px"}}>Welcome to Exam System</h1>
  <h2 style={{ textAlign: "left", marginTop: "60px",  marginLeft:"20px"  }}>Here is the exam notice:</h2>

  <h3 style={{  textAlign: "center", marginTop: "200px", marginBottom:"400px" }}>The exam is not available now. Please wait for it to be public.</h3>
 </div>)}

export default Exam;