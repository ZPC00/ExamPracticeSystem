import React, {  useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Alert,Switch } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

function ExamManagement() {
  // state for the exam modes
  const [examModes, setExamModes] = useState("");

  // set for setting question counts
  const [examSingleChoiceBankLengh, setExamSingleChoiceBankLengh] = useState(0);
  const [examMultipleChoiceBankLengh, setExamMultipleChoiceBankLengh] = useState(0);
  const [examFillingBlankBankLengh, setExamFillingBlankBankLengh] = useState(0);
  const [examJudgementsBankLengh, setExamJudgementsBankLengh] = useState(0);

  // alarm, errpr, success dispalying 
  const [alarm, setAlarm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // the function to get the exam modes from the back end at beginning
  const fetchExamModes = () => {
    axios.get('/getExamModes')
      .then(response => {
        setExamModes(response.data.examModesData);
        setExamSingleChoiceBankLengh(response.data.examSingleChoiceBankLengh);
        setExamMultipleChoiceBankLengh(response.data.examMultipleChoiceBankLengh);
        setExamFillingBlankBankLengh(response.data.examFillingBlankBankLengh);
        setExamJudgementsBankLengh(response.data.examJudgementsBankLengh);
      })
      .catch(error => {
        console.error('Error fetching exam modes:', error);
      });
  };
  

  // get the exam modes.
  useEffect(() => {
    fetchExamModes()
  }, []);

  // total score displaying
  const totalScore =
    (examModes.examSingleChoiceCount || 0) * (examModes.examSingleChoiceScore || 0) +
    (examModes.examMultipleChoiceCount || 0) * (examModes.examMultipleChoiceScore || 0) +
    (examModes.examFillingBlankCount || 0) * (examModes.examFillingBlankScore || 0) +
    (examModes.examJudgementsCount || 0) * (examModes.examJudgementsScore || 0);

  // handle saving funtion only aviliable during the valid time
  const handleSave = () => {
    if (dayjs(examModes.examEndTime).isBefore(dayjs(examModes.examStartTime))) {
      setError("End time must be after start time!");
      return;
    }
    // no quetion send the error message.
    if (examModes.examSingleCount === 0 && examModes.examMultipleCount === 0 && examModes.examFillingCount === 0 && examModes.examJudgementsCount === 0){
      setError("At least one questions is required!");
      return;
    }
    // send to back end to update.
    axios
    .post("/updateExamMode", examModes)
    .then(response => {
      setSuccess(response.data.message);
      fetchExamModes()
      setTimeout(() => setSuccess(""), 3000);
      setAlarm("");
      setError("");
    })
    .catch((error) => {
     console.error("Error updating exam mode:", error);
     setError("Failed to update exam settings. Please try again.");
  });}

  return (
    <div>
      {alarm && (<Alert variant="outlined" severity="warning" >{alarm}</Alert>)}       {/*alarm message if the user modify any informations without saving.*/}
      {error && (<Alert variant="outlined" severity="error" style={{ marginTop: "5px" }}>{error}</Alert> )}

      <h1 style={{ color: "#1976D2", textAlign: "center" }}>Exam Settings</h1>

      {/* Exam Available */}
      <Button
        variant="contained"
        style={{width: "200px",display: "flex",textAlign: "center",backgroundColor: examModes.examAvailable ? "green" : "red"}}        
        onClick={() => {setExamModes(prevExamModes => ({
          ...prevExamModes,
          examAvailable: !prevExamModes.examAvailable
        }));setAlarm("These modifications are not saved!");}}
      >
        Exam Available: {examModes.examAvailable ? "Enabled" : "Disabled"}
      </Button>
      
     {/* Exam Name */} 
      <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "20px", justifyContent:"center"}}>
      <h3>Exam Name:</h3>
        <TextField
          label="Exam Name"
          value={examModes.examName||""}
          onChange={(e) =>{setExamModes({...examModes,examName:e.target.value});setAlarm("These modifications are not saved!")}} 
          sx={{ width: "300px"}}
        />
       </div>

      {/* Exam Validity Period */}
      <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "20px" }}>

      <h3>Exam Validity Period:</h3>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <DateTimePicker label="Start Time" 
        value={dayjs(examModes.examStartTime)} 
        onChange={(e) => {
          setExamModes(prevState => ({
            ...prevState,
            examStartTime: dayjs(e) || dayjs(prevState.examStartTime)
          }));
          setAlarm("These modifications are not saved!");
        }}
        />
        ~
        <DateTimePicker label="End Time" value={dayjs(examModes.examEndTime)} 
        onChange={(e) => {
          setExamModes(prevState => ({
            ...prevState,
            examEndTime: dayjs(e) || dayjs(prevState.examEndTime)
          }));
          setAlarm("These modifications are not saved!");
        }} 
        minDateTime={dayjs(examModes.examStartTime)}/>
        </div>
      </LocalizationProvider>

      {/* Exam Time */}
      <h3>Exam Time (min):</h3>
      <TextField
        label="Exam Time (min)"
        type="number"
        value={examModes.examTime||0}
        onChange={(e) =>{setExamModes({...examModes,examTime:Number(e.target.value)});setAlarm("These modifications are not saved!")}} 
        inputProps={{ min: 1 }}
        sx={{ width: "250px" }}
      />
      </div>

      {/* Single Choice Configuration: counts and score*/}
      <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "20px" }}>
        <h3>Single Choice Counts:</h3>
        <TextField
          label="Single Choice Counts"
          type="number"
          value={examModes.examSingleChoiceCount||0}
          onChange={(e) =>{
            const newValue= Number(e.target.value)
            if (newValue>=0&&newValue<=examSingleChoiceBankLengh){
            setExamModes({...examModes,examSingleChoiceCount:newValue});setAlarm("These modifications are not saved!")}}}
          inputProps={{ min: 0 }}
          sx={{ width: "250px" }}
        />

        <h3 style={{ marginLeft: "30px" }}>Score per Single Choice:</h3>
        <TextField
          label="Score per Single Choice"
          type="number"
          value={examModes.examSingleChoiceScore||0}
          onChange={(e) =>{setExamModes({...examModes,examSingleChoiceScore:Number(e.target.value)});setAlarm("These modifications are not saved!")}}
          inputProps={{ min: 0.5 , step: 0.5 }}
          sx={{ width: "250px" }}
        />
      </div>

      {/* Multiple Choice Configuration: counts and score */}
      <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "20px" }}>
        <h3>Multiple Choice Counts:</h3>
        <TextField
          label="Multiple Choice Counts"
          type="number"
          value={examModes.examMultipleChoiceCount||0}
          onChange={(e) => {
            const newValue= Number(e.target.value)
            if (newValue>=0&&newValue<=examMultipleChoiceBankLengh){
            setExamModes({...examModes,examMultipleChoiceCount:newValue});setAlarm("These modifications are not saved!")}}}
          inputProps={{ min: 0 }}
          sx={{ width: "250px" }}
        />

        <h3 style={{ marginLeft: "15px" }}>Score per Multiple Choice:</h3>
        <TextField
          label="Score per Multiple Choice"
          type="number"
          value={examModes.examMultipleChoiceScore||0}
          onChange={(e) =>{ setExamModes({...examModes,examMultipleChoiceScore:Number(e.target.value)});setAlarm("These modifications are not saved!")}}
          inputProps={{ min: 0.5 , step: 0.5 }}
          sx={{ width: "250px" }}
        />
      </div>

      {/* Filling Blank Configuration: counts and score*/}
      <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "20px" }}>
        <h3>Filling Blank Counts:</h3>
        <TextField
          label="Filling Blank Counts"
          type="number"
          value={examModes.examFillingBlankCount||0}
          onChange={(e) => {
            const newValue= Number(e.target.value)
            if (newValue>=0&&newValue<=examFillingBlankBankLengh){
            setExamModes({...examModes,examFillingBlankCount:Number(newValue)});setAlarm("These modifications are not saved!")}}}
          inputProps={{ min: 0 }}
          sx={{ width: "250px" }}
        />

        <h3 style={{ marginLeft: "40px" }}>Score per Filling Blank:</h3>
        <TextField
          label="Score per Filling Blank"
          type="number"
          value={examModes.examFillingBlankScore||0}
          onChange={(e) => {setExamModes({...examModes,examFillingBlankScore:Number(e.target.value)});setAlarm("These modifications are not saved!")}}
          inputProps={{ min: 0.5 , step: 0.5 }}
          sx={{ width: "250px" }}
        />
      </div>

      {/* Judgements Configuration: counts and score*/}
      <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "20px" }}>
        <h3>Judgements Counts:</h3>
        <TextField
          label="Judgements Counts"
          type="number"
          value={examModes.examJudgementsCount||0}
          onChange={(e) => {
            const newValue= Number(e.target.value)
            if (newValue>=0&&newValue<=examJudgementsBankLengh){
            setExamModes({...examModes,examJudgementsCount:newValue});setAlarm("These modifications are not saved!")}}}
          inputProps={{ min: 0 }}
          sx={{ width: "250px" }}
        />

        <h3 style={{ marginLeft: "35px" }}>Score per Judgements:</h3>
        <TextField
          label="Score per Judgements"
          type="number"
          value={examModes.examJudgementsScore||0}
          onChange={(e) => {setExamModes({...examModes,examJudgementsScore:Number(e.target.value)});setAlarm("These modifications are not saved!")}}
          inputProps={{ min: 0.5 , step: 0.5 }}
          sx={{ width: "250px" }}
        />
        </div>

        {/* Visible of grades and answers*/}
        <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "20px" }}>
          <h3>Student Grades Visible:</h3>
          <Switch
          checked={examModes.examStudentGradesVisible}
          onClick={() => {setExamModes(prevExamModes => ({
            ...prevExamModes,
            examStudentGradesVisible: !prevExamModes.examStudentGradesVisible
          }));setAlarm("These modifications are not saved!");}}
          inputProps={{ 'aria-label': 'controlled' }} />
          <h3 style={{ marginLeft: "195px" }}>Student Answer Visible:</h3>
          
          <Switch
          checked={examModes.examStudentAnswerVisible}
          onClick={() => {setExamModes(prevExamModes => ({
            ...prevExamModes,
            examStudentAnswerVisible: !prevExamModes.examStudentAnswerVisible
          }));setAlarm("These modifications are not saved!");}}
          inputProps={{ 'aria-label': 'controlled' }} />
        </div>

      <h2 style={{ textAlign: "left", marginTop: "40px",marginBottom: alarm ? "0px":"80px"}}>Total Score: {totalScore}</h2>
      {success && (<Alert variant="outlined" severity="success" style={{ marginTop: "5px", justifyContent:"center"}}>{success}</Alert>)}
      
      {/*Only dispalyed if the user modify the information without saving.*/}
      {alarm&&(
      <Button variant="contained" style={{ width: "160px", marginTop: "30px", marginBottom:"30px" }} onClick={handleSave}>
        Save
      </Button>)}
    </div>
  );
}

export default ExamManagement;