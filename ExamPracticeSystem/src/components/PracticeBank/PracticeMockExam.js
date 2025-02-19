import React, { useState, useContext,useEffect } from "react";
import { AppContext } from "../AppContext";
import {Button, Checkbox, TextField, FormControlLabel, Radio, RadioGroup, Typography, Stack, Alert} from "@mui/material";
import axios from 'axios';
import _ from "lodash"
import ExamPracticeResult from "../GradesView/ExamPracticeResult"


function PracticeMockExam() {

  const { practiceBank, setPracticeBank, setUserAccount,username,setfuncts } = useContext(AppContext);

  const singleChoiceBank = _.shuffle(practiceBank.filter(q => q.type === "Single Choice"))
  const multipleChoiceBank = _.shuffle(practiceBank.filter(q => q.type === "Multiple Choice"))
  const fillingBlankBank = _.shuffle(practiceBank.filter(q => q.type === "Filling Blank"))
  const judgementsBank = _.shuffle(practiceBank.filter(q => q.type === "Judgements"))

  // state for change homepage
  const [practiceHomepage, setPracticeHomepage] = useState(true);
  const [randomOptions, setRandomOptions] = useState([]);
  

  // state for filter question bank
  const [practiceFilterBank, setPracticeFilterBank] = useState([]);
  const [practiceSingleCounts, setPracticeSingleCounts] = useState(0);
  const [practiceMultipleCounts, setPracticeMultipleCounts] = useState(0);
  const [practiceFillingCounts, setPracticeFillingCounts] = useState(0);
  const [practiceJudgementsCounts, setPracticeJudgementsCounts] = useState(0);
  const [practiceTime, setPracticeTime] = useState(1);
  const [submitted, setSubmitted] = useState(false);               // set for the prevent not to submit twice

  // state for the process of quiz
  const [userAnswer, setUserAnswer] = useState("");
  const [showSubmitBottun, setShowSubmitBottun] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = practiceFilterBank[currentIndex];

  const [error, setError] = useState("");
  const [timer, setTimer] = useState(practiceTime * 60); // Timer in seconds

  useEffect(() => {
    setTimer(practiceTime * 60); // Update timer based on practiceTime (in minutes)
  }, [practiceTime]);


    // listen for currentIndex changes, randomize the order of options
  useEffect(() => {
      if (currentQuestion && (currentQuestion.type === "Single Choice" || currentQuestion.type === "Multiple Choice")) {
        const randomOptionList = _.shuffle(["A", "B", "C", "D", "E"]); // randomize the order of options
        setRandomOptions(randomOptionList);
      }                          
  }, [currentIndex, currentQuestion]); // listen for current index, current qustion changes

  // Timer logic
  useEffect(() => {
    let countdown;
    if (!practiceHomepage && timer > 0) {
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
  }, [practiceHomepage, timer]);

  // the function for handle submit each user's question
  const handleSubmitUserAnswer = (QuestionType) => {
    let handleUserAnswer = userAnswer;
    let handleCorrectAnswer = currentQuestion.correctAnswer;
    
    // sort the correct answer letters to compare the correctness of the questions it its type is Choice
    if (QuestionType === "Single Choice" || QuestionType === "Multiple Choice") {
      handleUserAnswer = userAnswer.split("").sort().join("").toUpperCase();
      handleCorrectAnswer = currentQuestion.correctAnswer.split("").sort().join("").toUpperCase();
    }
    
    // define the correctness of users' answers
    const correctness = handleUserAnswer === handleCorrectAnswer;
    
    //store the user's answer to review
    setAttempts(prev => {
      const updatedAttempts = [...prev];
      updatedAttempts[currentIndex] = { qID:currentQuestion.id ,userAnswer: userAnswer, correctness };
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
    const nextIndex = (currentIndex + 1) % practiceFilterBank.length;    // if the last question jump to the first one
    if(nextIndex === 0 ){
      setShowSubmitBottun(true)
    }else{
      handleJumpToQuestion(nextIndex);
    }
  };

  
// the function to submit the exam
const handleSubmitExam = () => {
  if (submitted) return; // 防止重复提交
    setSubmitted(true);

  // Ensure the current user's answer is stored if it's different
  if (attempts[currentIndex].userAnswer !== userAnswer) {
    handleSubmitUserAnswer(currentQuestion.type);
  }
  console.log(attempts)
  // Calculate Practice Score and Incorrect Questions List
  const PracticeScore = attempts.filter((a) => a.correctness).length;
  const IncorrectQIDList = attempts.filter((a) => !a.correctness).map((a) => a.qID);

  const newExamResultInfo = {
    loginUsername: username,
    practiceScore: PracticeScore,
    IncorrectQList: IncorrectQIDList,
  };

  console.log(newExamResultInfo); // Log the updated result before sending it

  // Send the exam result to the server
  axios
    .post("/updatePracticeResult", newExamResultInfo)
    .then((response) => {
      setUserAccount(response.data.updatedUserAccount);
      setTimeout(() => {
        setPracticeBank(response.data.updatedPracticeQuestion);
      }, 0);
      console.log(response.data.message);
      setfuncts(<ExamPracticeResult attempts={attempts} PracticeScore={PracticeScore}/>);
    })
    .catch((error) => {
      console.error("UpdateError", error);
    });
  };

    // the function to filter the type of questions
    const startMockExam = () => {
      const selectedQuestions = [
        ...(practiceSingleCounts > 0 ? singleChoiceBank.slice(0, practiceSingleCounts) : []),
        ...(practiceMultipleCounts > 0 ? multipleChoiceBank.slice(0, practiceMultipleCounts) : []),
        ...(practiceFillingCounts > 0 ? fillingBlankBank.slice(0, practiceFillingCounts) : []),
        ...(practiceJudgementsCounts > 0 ? judgementsBank.slice(0, practiceJudgementsCounts) : []),
      ];
    
      if (selectedQuestions.length > 0) {
        const shuffledQuestions = _.shuffle(selectedQuestions); // Shuffle selected questions
        setPracticeFilterBank(shuffledQuestions);              // disorder select questions bank.
        const initializationAttempts = shuffledQuestions.map((question) => ({
          qID: question.id,
          userAnswer: "",
          correctness: false,
        }));
        setAttempts(initializationAttempts);
        setSubmitted(false)
        setPracticeHomepage(false);
      } else {
        setError("At least one question required.");
        setTimeout(() => {
          setError("");
        }, 3000);
      }
    };
        
  
  return practiceHomepage ? (
    <div>

        <h1 style={{ color: "#1976D2", textAlign: "center", marginTop: "30px" }}>Welcome to the Mock Exam</h1>
        <h2 style={{ textAlign: "left", marginTop: "60px" }}>Please input initialization data for the mock exams:</h2>

        <div style={{  textAlign: "left", marginTop: "100px", display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
        <h3>Mock Exam Time:</h3>
        <TextField
          id="outlined-number"
          label="Mock Exam Time (min)"
          type="number"
          value={practiceTime}
          onChange={(e) => setPracticeTime(e.target.value)}
          error={practiceTime <= 0}
          helperText={practiceTime <= 0 ? `Enter a number greater than 0`:""}
          inputProp={{ min: 0 }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{ marginLeft: "75px", width: "250px" }}
        />
        </div>
        <div style={{  textAlign: "left", marginTop: "30px", display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
        <h3>Single Choice Counts:</h3>
        <TextField
          id="outlined-number"
          label="Single Choice Counts"
          type="number"
          value={practiceSingleCounts}
          onChange={(e) => {
            const newValue = e.target.value
            if (newValue>=0 && newValue<=singleChoiceBank.length){
              setPracticeSingleCounts(newValue)}}}
          inputProp={{ min: 0, max: singleChoiceBank.length }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{ marginLeft: "35px", width: "250px" }}
        />
        </div>

        <div style={{  textAlign: "left", marginTop: "30px", display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
        <h3>Multiple Choice Counts:</h3>
        <TextField
          id="outlined-number"
          label="Multiple Choice Counts"
          type="number"
          value={practiceMultipleCounts}
          onChange={(e) => {
            const newValue = e.target.value
            if (newValue>=0 && newValue<=multipleChoiceBank.length){
            setPracticeMultipleCounts(newValue)}}}
         inputProp={{ min: 0, max: multipleChoiceBank.length }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{ marginLeft: "20px", width: "250px" }}
        />
        </div>

        <div style={{  textAlign: "left", marginTop: "30px", display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
        <h3>Filling Blank Counts:</h3>
        <TextField
          id="outlined-number"
          label="Filling Blank Counts"
          type="number"
          value={practiceFillingCounts}
          onChange={(e) => {
            const newValue = e.target.value
            if (newValue>=0 && newValue<=fillingBlankBank.length){ 
            setPracticeFillingCounts(newValue)}}}
          inputProp={{ min: 0, max: fillingBlankBank.length }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{ marginLeft: "45px", width: "250px" }}
        />
        </div>

        <div style={{  textAlign: "left", marginTop: "30px", display: 'flex', alignItems: 'center', marginLeft:"20px" }}>
        <h3>Judgements Counts:</h3>
        <TextField
          id="outlined-number"
          label="Judgements Counts"
          type="number"
          value={practiceJudgementsCounts}
          onChange={(e) => {
            const newValue = e.target.value
            if (newValue>=0 && newValue<=judgementsBank.length){ 
            setPracticeJudgementsCounts(newValue)}}}
          inputProp={{ min: 0, max: judgementsBank.length }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{ marginLeft: "45px", width: "250px" }}
        />
        </div>

        {/* error allert to notice the users*/}        
        <Button variant="contained" style={{ width: "160px", marginTop: "50px", marginBottom:error ? "0px" : "90px"}} onClick={() => startMockExam()}>
          Start Mock Exam
        </Button>

        {/* error allert to notice the users*/}
        { error && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", marginBottom: "20px" }}>
        {error && (
          <Alert variant="outlined" severity="error" style={{ width: "270px", textAlign: "center" }}>
            {error}
          </Alert>
        )}
      </div>
      )}

    </div>
  ) : (
    //  Page for practice process
    <div>
      {/* Timer Display */}
      <Typography variant="h5" bold style={{ marginTop: "20px", textAlign: "left", color: timer > practiceTime*6 ? "black":"red",fontWeight: "bold"}}>
        Time Left: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </Typography>

  
    <div style={{ display: "flex", gap: "20px", padding: "20px", height: "800px" }}>
      {/* question part */}
      <div style={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          {currentIndex + 1}. {currentQuestion.Question}
        </Typography>

        {/* Single Choice*/}
        {currentQuestion.type === "Single Choice" && (
          <RadioGroup
            value={userAnswer}
            onChange={(e) => {

                setUserAnswer(e.target.value);
              }
            }
          >
            {/*display the optional choice squentially*/}
            {randomOptions.map(
              (option) =>
                currentQuestion[option] && (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={`${currentQuestion[option]}`} />
                )
            )}
          </RadioGroup>
        )}

        {/* Multiple Choice */}
        {currentQuestion.type === "Multiple Choice" && (
          <Stack spacing={1}>
            {/*display the optional choice squentially*/}
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
            onChange={(e) => setUserAnswer(e.target.value)}
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
              }
            }
          >
            <FormControlLabel value="True" control={<Radio />} label="True" />
            <FormControlLabel value="False" control={<Radio />} label="False" />
          </RadioGroup>
        )}

        {/* only no answered question display submit button*/}
        <Button variant="outlined" color="secondary" onClick={() => {
            if (showSubmitBottun) {
              if (window.confirm("Submission can't be rolled back, are you sure?")) {
                handleSubmitExam();                                                      // Call submit exam if confirmed
              }
            } else {
              handleNext();                                                              // Call next if not submitting
            }
            }} style={{ marginTop: "10px", marginLeft: "10px" }}>
            {showSubmitBottun? "Submit" : "Next"}
        </Button>

      </div>

      {/* question index list */}
      <div style={{ borderLeft: "1px solid #ccc", paddingLeft: "10px", maxHeight: "800px", overflowY: "auto" }}>
        <Typography variant="h5">Practice Question List</Typography>
        <br />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>   {/* 5 buttons each line and gap is 10px*/}
          {practiceFilterBank.map((_, index) => (
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
  );
}

export default PracticeMockExam;