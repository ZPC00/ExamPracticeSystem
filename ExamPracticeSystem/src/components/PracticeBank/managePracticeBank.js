import React, { useState, useContext } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Pagination, IconButton,Tooltip, Alert, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete } from '@mui/material';
import { UploadFile as UploadFileIcon, Edit as EditIcon, Delete as DeleteIcon, ReportProblem as ReportProblemIcon,AddCircleOutline as AddCircleOutlineIcon, ImageOutlined as ImageOutlinedIcon} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { AppContext } from '../AppContext';
import axios from 'axios';
import * as XLSX from 'xlsx';


function Title({ children }) {
  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {children}
    </Typography>
  );
}

Title.propTypes = {
  children: PropTypes.node,
};

function ManagePracticeBank() {
  // Context to get and set practice questions
  const { practiceBank, setPracticeBank } = useContext(AppContext);
  
  // success or error alert
  const [outSuccess, setOutSuccess] = useState(null);
  const [error, setError] = useState("");

  // confirmation module
  const [showConfirmation, setShowConfirmation] = useState("");
  
  // Filter questions based on search term
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredQuestion = practiceBank.filter(
    (question) =>
      (question.Question && question.Question.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (question.type && question.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (question.A && question.A.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (question.B && question.B.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (question.C && question.C.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (question.D && question.D.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (question.E && question.E.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (question.correctAnswer && String(question.correctAnswer).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (question.description && question.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Add or edit the question
  const [isEditingOrAdd, setIsEditingOrAdd] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [updatedInfo, setUpdatedInfo] = useState({});

  // view detail of the image
  const [viewImage, setViewImage] = useState(null)

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 11;
  const pageCount = Math.ceil(filteredQuestion.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = filteredQuestion.slice(startIndex, endIndex);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle deletion of a question with double click
  const handleDeleteQuestion = (id) => {
    if (!showConfirmation) {
      setShowConfirmation("Click it again to delete");
      setTimeout(() => {
        setShowConfirmation("");
      }, 2000);
    } else {
      // delete and send backend to update
      axios
        .post('https://exampracticesystem-backend.onrender.com/deletePracticeQuestion', { id })
        .then((response) => {
          setPracticeBank(response.data.updatedPracticeQuestion);
          setOutSuccess(response.data.message);
          setTimeout(() => {
            setOutSuccess("");
          }, 3000);
          setIsEditingOrAdd(false);
          setUpdatedInfo({});
          setSelectedQuestion("")
        })
        .catch((error) => {
          console.error('Error deleting questions:', error);
        });
    }
  };

  // Handle question update initiation
  const handleUpdateQuestion = (question) => {
    setSelectedQuestion(question);
    setUpdatedInfo(question);
    setIsEditingOrAdd(true);
  };

  // handle upload Image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("Image size should be smaller than 5MB.");
        setTimeout(() => {
          setError("");
        }, 3000);
        return;}
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedInfo((prevState) => ({
          ...prevState,
          image: reader.result, // Store the base64 string of the image in updatedInfo
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to save for adding or updating a question
  const handleSaveChanges = () => {
    // set the input fields based on question type
    if (
      !( (updatedInfo.type==="Single Choice" && updatedInfo.A && updatedInfo.correctAnswer) || 
         (updatedInfo.type==="Multiple Choice" && updatedInfo.A && updatedInfo.B && updatedInfo.correctAnswer) ||
         (updatedInfo.type==="Filling Blank" && updatedInfo.correctAnswer) ||
         (updatedInfo.type==="Judgements" && (updatedInfo.correctAnswer === "True" || updatedInfo.correctAnswer === "False"))
      ))
     {
      setError("All the information required.");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
    // update question which have id
    if (updatedInfo.id) {

      // send backend to update
      axios
        .post("https://exampracticesystem-backend.onrender.com/savePracticeQusetion", updatedInfo)
        .then((response) => {
          setPracticeBank(response.data.updatedPracticeQuestion);
          setOutSuccess(response.data.message);
          setTimeout(() => {
            setOutSuccess("");
          }, 3000);
          setIsEditingOrAdd(false);
          setUpdatedInfo({});
          setSelectedQuestion("")
        })
        .catch((error) => {
          console.error("Error updating question:", error);
        });
    } 
    // add question which means no id
    else {
      // send backend to update
      axios
        .post("https://exampracticesystem-backend.onrender.com/savePracticeQusetion", updatedInfo )
        .then((response) => {
          setPracticeBank(response.data.updatedPracticeQuestion);
          setOutSuccess(response.data.message);
          setTimeout(() => {
            setOutSuccess("");
          }, 3000);
          setIsEditingOrAdd(false);
          setUpdatedInfo({});
          setSelectedQuestion("")
        })
        .catch((error) => {
          console.error("Error adding question:", error);
        });
    }
  };

  // Handle file upload for importting the questions
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];  // first sheet of the excel
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // handle there is no data
      if (jsonData.length < 2) {
        console.warn("there is no data");
        return;
      }
  
      // jump the title row and pack the import questions
      const excelUpdateData = jsonData.slice(1).map((row) => ({
        type: row[0] ? String(row[0]).trim() : '',
        Question: row[1] ? String(row[1]).trim() : '',
        A: row[2] ? String(row[2]).trim() : '',
        B: row[3] ? String(row[3]).trim() : '',
        C: row[4] ? String(row[4]).trim() : '',
        D: row[5] ? String(row[5]).trim() : '',
        E: row[6] ? String(row[6]).trim() : '',
        correctAnswer: row[7] ? String(row[7]).trim() : '',
        description: row[8] ? String(row[8]).trim() : '',
      }));

      // send to backend to update
      axios
        .post("https://exampracticesystem-backend.onrender.com/excelPracticeUpdate", excelUpdateData)
        .then((response) => {
          setPracticeBank(response.data.updatedPracticeQuestion);
          alert(`${response.data.message} Please review the correctness of these questions!`);
        })
        .catch((error) => {
          console.error("Add question failed:", error);
        });
    };
    reader.readAsArrayBuffer(file);
  };

  
  return (
    <div>
      <div style={{ display: 'flex', maxHeight: '100%', minWidth: '40%' }}>
        <div style={{ flex: 2, color: '#1976D2', marginLeft: '30px' }}>
          <br />

          {/* Alert module*/}
          {outSuccess && (
            <Alert variant="outlined" severity="success">
              {outSuccess}
            </Alert>
          )}
          {/* add question module contains add module and import excel*/}
      <div
        style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",}}>

          {/*upload excel botton*/}
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mr: 2 }}
          >
          Import Excel
        <input
          type="file"
          accept=".xlsx, .xls"
          hidden
          onChange={handleFileUpload}/>

        {/* Add quesion botton*/}
          </Button>
            <Button onClick={() => { setSelectedQuestion(""); setUpdatedInfo({});setIsEditingOrAdd(true)}} variant="contained" sx={{ mr: 1 }} startIcon={<AddCircleOutlineIcon/>}>
              Add Question
            </Button>
            <h1 style={{ flexGrow: 1, textAlign: "center", margin: 0 }}>
              Practice Questions Management
            </h1>
            <TextField
              label="Filter Questions"
              variant="standard"
              margin="normal"
              value={searchTerm}
              onChange={(e) => {setPage(1);setSearchTerm(e.target.value)}}
              style={{ marginLeft: "auto" }}
          />
          
          </div>

          {/* display questions table */}
          {paginatedRows.length > 0 ? (
            <Table size="large">
              <TableHead>
                <TableRow>
                  <TableCell>Question ID</TableCell>
                  <TableCell>Question Type</TableCell>
                  <TableCell>Question Title</TableCell>
                  <TableCell>A</TableCell>
                  <TableCell>B</TableCell>
                  <TableCell>C</TableCell>
                  <TableCell>D</TableCell>
                  <TableCell>E</TableCell>
                  <TableCell>Correct Answerer</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Incorrect Counts</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow key={row.id} style={{ cursor: 'pointer' }}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>
                      {row.image && (
                        <>
                        <IconButton onClick={() => setViewImage(row.image)}>
                          <ImageOutlinedIcon />
                            </IconButton>
                        </>
                        )}{row.Question}
                    </TableCell>

                    <Dialog open={Boolean(viewImage)} onClose={() => setViewImage(null)}>
                      {viewImage && (
                        <img 
                          src={viewImage} 
                          alt="Preview" 
                          style={{ maxWidth: '700px', maxHeight: '500px' }} 
                        />
                       )}
                    </Dialog>
                    <TableCell>{row.A}</TableCell>
                    <TableCell>{row.B}</TableCell>
                    <TableCell>{row.C}</TableCell>
                    <TableCell>{row.D}</TableCell>
                    <TableCell>{row.E}</TableCell>
                    <TableCell>{row.correctAnswer}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.inCorrectCount}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* double click to delete module*/}
                      <Tooltip
                        title={
                          showConfirmation ? "Click it again to delete" : "Double click to delete"
                        }
                      >
                        <DeleteIcon
                          onClick={() => handleDeleteQuestion(row.id)}
                          size="small"
                        />
                      </Tooltip>

                      {/* edit question module*/}
                      <Tooltip title="Edit">
                        <EditIcon
                          onClick={() => handleUpdateQuestion(row)}
                          style={{ marginLeft: '10px' }}
                        />
                      </Tooltip>

                      {(() => {
                          let problemReport = "";
                          if (row.type === "Single Choice") {
                              const isValid = /^[ABCDE]+$/.test(row.correctAnswer)
                              if (!row.A) {
                                problemReport = "You should have at least 1 optional choice!";
                              } else if (row.correctAnswer.length !== 1) {
                                problemReport = "Only 1 choice can be chosen!";
                              }
                              else if (!isValid) {
                                problemReport = "Only A B C D E are available";
                              }
                            } else if (row.type === "Multiple Choice") {
                              const isValid = /^[ABCDE]+$/.test(row.correctAnswer)
                              const choices = [row.A, row.B, row.C, row.D, row.E].filter(Boolean);
                              if (choices.length < 2) {
                                problemReport = "At least 2 optional choices (A and B) are required!";
                              } else if (row.correctAnswer.length < 1 || row.correctAnswer.length > 5) {
                                problemReport = "Correct answers must be between 1 and 5 choices!";
                              }
                              else if (!isValid) {
                                problemReport = "Only A B C D E are available";
                              }
                            } else if (row.type === "Filling Blank") {
                              if (!row.correctAnswer) {
                                problemReport = "The correct answer is required!";
                              }
                            } else if (row.type === "Judgements") {
                             if (row.correctAnswer !== "True" && row.correctAnswer !== "False") {
                                problemReport = 'The correct answer must be "True" or "False"!';
                              }
                            }
                            else if (!row.question) {
                                 problemReport = 'Question title is required.';
                             }
                            return (
                              problemReport && (
                                <Tooltip title={problemReport}>
                                  <ReportProblemIcon style={{ color: "red" }} />
                                </Tooltip>
                              )
                            );
                          })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div>
              <br /> <br /> <br />
              <div style={{ fontSize: '1.2em' }}>No Question available.</div>
            </div>
          )}
          <Pagination count={pageCount} page={page} onChange={handleChangePage} />
        </div>
      </div>

      {/* Add or Edit Dialog */}
      <Dialog open={isEditingOrAdd} onClose={() => setIsEditingOrAdd(false)}>
        <DialogTitle style={{ minWidth: '1000px' }}>{selectedQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
        <DialogContent>

          {/* only edit display and can't be modified*/}
          {selectedQuestion&&(<TextField
            label="Question ID"
            value={updatedInfo.id || ''}
            style={{ marginTop: '20px' }}
            fullWidth
            InputProps={{ readOnly: true }}/>)}

          <Autocomplete
            disablePortal
            options={['Single Choice', 'Filling Blank', 'Multiple Choice','Judgements']}
            value={updatedInfo.type || ''}
            onChange={(event, newValue) => setUpdatedInfo({ ...updatedInfo, type: newValue })}
            style={{ marginTop: '20px' }}
            fullWidth
            renderInput={(params) => <TextField {...params} label="Type" />}/>

          <TextField
            label="Question Title"
            value={updatedInfo.Question || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, Question: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth/>

          {/* only display which the type of quesiton is choice*/}
          {(updatedInfo.type === 'Single Choice' || updatedInfo.type === 'Multiple Choice')&&(
          <div>
          <TextField
            label="A"
            value={updatedInfo.A || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, A: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth/>

          <TextField
            label="B"
            value={updatedInfo.B || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, B: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth/>

          <TextField
            label="C"
            value={updatedInfo.C || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, C: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth/>

          <TextField
            label="D"
            value={updatedInfo.D || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, D: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth/>

          <TextField
            label="E"
            value={updatedInfo.E || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, E: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth/>
          </div>
          )}

          {/* only display which the type of quesiton is single choice*/}
          {(updatedInfo.type === 'Single Choice')&&(
          <Autocomplete
            disablePortal
            options={['A', 'B', 'C','D','E']}
            value={updatedInfo.correctAnswer || ''}
            onChange={(event, newValue) => setUpdatedInfo({ ...updatedInfo, correctAnswer: newValue })}
            style={{ marginTop: '20px' }}
            fullWidth
            renderInput={(params) => <TextField {...params} label="Correct Answerer" />}
          />)}

          {/* only display which the type of quesiton is multiple choice*/}
          {updatedInfo.type === 'Multiple Choice' && (
              <TextField
                label="Correct Answerer"
                value={updatedInfo.correctAnswer || ''}
                onChange={(e) => {
                  const newValue = e.target.value.toUpperCase(); // Ensure it's uppercase
                  // Check if input contains only A, B, C, D, E (any combination)
                  const isValid = /^[ABCDE]+$/.test(newValue); // Regular expression to allow only ABCDE, at least 1 character
                  if (isValid || newValue === '') {
                    setUpdatedInfo({ ...updatedInfo, correctAnswer: newValue });
                    setError(''); // Clear error if input is valid
                  } else {
                    setError('Please enter a valid answer containing only A, B, C, D, E');
                  }
                }}
                style={{ marginTop: '20px' }}
                fullWidth/>

            )
          }

          {/* only display which the type of quesiton is filling blank*/}
          {(updatedInfo.type === 'Filling Blank')&&(
          <TextField
            label="Correct Answerer"
            value={updatedInfo.correctAnswer || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, correctAnswer: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth/> 
          )}

          {/* only display which the type of quesiton is Judgements*/}
          {(updatedInfo.type === 'Judgements')&&(
          <Autocomplete
            disablePortal
            options={['True', 'False']}
            value={updatedInfo.correctAnswer || ''}
            onChange={(event, newValue) => setUpdatedInfo({ ...updatedInfo, correctAnswer: newValue })}
            style={{ marginTop: '20px' }}
            fullWidth
            renderInput={(params) => <TextField {...params} label="Correct Answerer" />}/>
          )}

          <TextField
          label="Description"
          value={updatedInfo.description || ''}
          multiline
          onChange={(e) => setUpdatedInfo({ ...updatedInfo, description: e.target.value })}
          style={{ marginTop: '20px' }}
          fullWidth/>

          {/* Image Upload Section */}
          <div style={{ marginTop: '20px' }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </Button>
              
            {updatedInfo.image && (
              <div style={{ marginTop: '10px' }}>
                <img src={updatedInfo.image} alt="Preview" style={{ maxWidth: '400px', maxHeight: '250px' }} />
                <IconButton onClick={() => setUpdatedInfo((prevState) => ({ ...prevState, image: "" }))}> <DeleteIcon/> </IconButton>
              </div>
            )}
          </div>

          {/* error allert to notice the users*/}
          {error && (
          <Alert variant="outlined" severity="error" style={{ marginTop: '20px' }}>
            {error}
          </Alert>
          )}
        </DialogContent>
        <DialogActions>
        <Button onClick={() => { setIsEditingOrAdd(false);setUpdatedInfo({});setSelectedQuestion("")}}>Cancel</Button>

          <Button onClick={handleSaveChanges} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ManagePracticeBank;
