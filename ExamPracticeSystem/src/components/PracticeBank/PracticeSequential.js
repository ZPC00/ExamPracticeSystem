import React, { useState, useContext } from "react";
import { AppContext } from "../AppContext";
import {Button, Checkbox, TextField, FormControlLabel, Radio, RadioGroup, Typography, Stack, Alert} from "@mui/material";

function PracticeSequential() {

  const { practiceBank } = useContext(AppContext);

  // state for change homepage
  const [practiceHomepage, setPracticeHomepage] = useState(true);

  // state for filter question bank
  const [practiceFilterBank, setPracticeFilterBank] = useState([]);

  // state for the process of quiz
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = practiceFilterBank[currentIndex];

  // error notifications
  const [error, setError] = useState("");

  // the function for handle submit
  const handleSubmit = (QuestionType) => {
    let handleUserAnswer = userAnswer;
    let handleCorrectAnswer = currentQuestion.correctAnswer;
    
    // sort the correct answer letters to compare the correctness of the questions it its type is Choice
    if (QuestionType === "Single Choice" || QuestionType === "Multiple Choice") {
      handleUserAnswer = userAnswer.split("").sort().join("").toUpperCase();
      handleCorrectAnswer = currentQuestion.correctAnswer.split("").sort().join("").toUpperCase();
    }
    
    // define the correctness of users' answers
    const correctness = handleUserAnswer === handleCorrectAnswer;
    
    // set for displaying the result
    setIsCorrect(correctness);
    setShowResult(true);
    
    //store the user's answer to review
    setAttempts((prev) => ({
      ...prev,
      [currentIndex]: {
        userAnswer: handleUserAnswer,
        correctness,
      },
    }));
  };
  
  // the function to deal jump to target quesstion
  const handleJumpToQuestion = (index) => {
    setCurrentIndex(index);
    setShowResult(false);

    // dispaly the result if has answered the question
    if (attempts[index]) {
      setUserAnswer(attempts[index].userAnswer);
      setShowResult(true);
      setIsCorrect(attempts[index].correctness);
    } else {
      setUserAnswer("");
    }
  };
  
  // the function to deal next button
  const handleNext = () => {
    setShowResult(false);
    setUserAnswer("");
    const nextIndex = (currentIndex + 1) % practiceFilterBank.length;    // if the last question jump to the first one
    handleJumpToQuestion(nextIndex);
  };

    // the function to filter the type of questions
    const handleSelectQuestionType = (filterType) => {
      const filteredBank = filterType ? practiceBank.filter(q => q.type === filterType) : practiceBank;
      if(filteredBank.length!==0){
      setPracticeFilterBank(filteredBank);
      setPracticeHomepage(false);}
      else{
        setError("There is no questions in such type of the questions bank!")
        setTimeout(() => {
          setError("");
        }, 3000);
      }
    };

  return practiceHomepage ? (
    <div>
        {/* error allert to notice the users*/}
          {error && (
            <Alert variant="outlined" severity="error" style={{ textAlign: "center" }}>
              {error}
           </Alert>
          )}
        <h1 style={{ color: "#1976D2", textAlign: "center", marginTop: "50px" }}>Welcome to the Sequential Practice Quiz</h1>
        <h2 style={{ textAlign: "left", marginTop: "60px" }}>Please choose the question type you need to practice:</h2>
         <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "200px", marginBottom: "150px", alignItems: "center" }}>

            <Button variant="contained" style={{ width: "200px" }} onClick={() => handleSelectQuestionType(null)}>
              All questions
             </Button>
            
            <Button variant="contained" style={{ width: "200px" }} onClick={() => handleSelectQuestionType("Single Choice")}>
              Single Choice
            </Button>
            
            <Button variant="contained" style={{ width: "200px" }} onClick={() => handleSelectQuestionType("Multiple Choice")}>
              Multiple Choice
            </Button>
            
            <Button variant="contained" style={{ width: "200px" }} onClick={() => handleSelectQuestionType("Filling Blank")}>
              Filling Blank
            </Button>
            
            <Button variant="contained" style={{ width: "200px" }} onClick={() => handleSelectQuestionType("Judgements")}>
              Judgements
            </Button>
        </div>
    </div>
  ) : (
    //  Page for practice process
    <div style={{ display: "flex", gap: "20px", padding: "20px", height: "800px" }}>
      {/* question part */}
      <div style={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          {currentIndex + 1}. {currentQuestion.Question}
        </Typography>
        
        {currentQuestion.image && (
              <div style={{ marginTop: '10px', textAlign: "center" }}>
                <img src={currentQuestion.image} alt="Preview" style={{ maxWidth: '400px', maxHeight: '250px' }} />
              </div>
            )}

        {/* Single Choice*/}
        {currentQuestion.type === "Single Choice" && (
          <RadioGroup
            value={userAnswer}
            onChange={(e) => {
              // only handle no answered question
              if (!attempts[currentIndex]) {
                setUserAnswer(e.target.value);
              }
            }}
          >
            {/*display the optional choice squentially*/}
            {["A", "B", "C", "D", "E"].map(
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
            {["A", "B", "C", "D", "E"].map(
              (option) =>
                currentQuestion[option] && (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={userAnswer.includes(option)}
                        onChange={(e) => {
                          // only handle no answered question
                          if (!attempts[currentIndex]) {
                            setUserAnswer((prev) =>
                              e.target.checked ? prev + option : prev.replace(option, "")
                            );
                          }
                        }}
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
            InputProps={{ readOnly: attempts[currentIndex] }}      // answered question read only
          />
        )}

        {/* Judgements */}
        {currentQuestion.type === "Judgements" && (
          <RadioGroup
            value={userAnswer}
            onChange={(e) => {
              // only handle no answered question
              if (!attempts[currentIndex]) {
                setUserAnswer(e.target.value);
              }
            }}
          >
            <FormControlLabel value="True" control={<Radio />} label="True" />
            <FormControlLabel value="False" control={<Radio />} label="False" />
          </RadioGroup>
        )}

        {/* only no answered question display submit button*/}
        {!attempts[currentIndex] && (
          <Button variant="contained" color="primary" onClick={() => handleSubmit(currentQuestion.type)} style={{ marginTop: "10px" }}>
            Submit
          </Button>
        )}

        {/*show result module*/}
        {showResult && (
          <div>
            <Typography style={{ marginTop: "10px", color: isCorrect ? "green" : "red" }}>
              {isCorrect ? "Correct!" : (
                <>
                  Incorrect! <br />
                  Correct Answer:{" "}
                  {["Single Choice", "Multiple Choice"].includes(currentQuestion.type)
                    ? currentQuestion.correctAnswer.split("").map(option => currentQuestion[option]).join(", ")  //display the detailed content of the optinal choices if the question type is choices
                    : currentQuestion.correctAnswer}
                </>
              )}
            </Typography>
            <br />
            {/* Display Description */}
            <Typography style={{ textAlign: "left" }} variant="body2" color="textSecondary">
              Description: {currentQuestion.description ? currentQuestion.description : "None"}
            </Typography>

            <Button variant="outlined" color="secondary" onClick={handleNext} style={{ marginTop: "10px", marginLeft: "10px" }}>
              Next
            </Button>
          </div>
        )}
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
                backgroundColor: attempts[index] ? (attempts[index].correctness ? "green" : "red") : "#ccc",    // correct red ,incorrect red, unanswered light grey
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
  );
}

export default PracticeSequential;