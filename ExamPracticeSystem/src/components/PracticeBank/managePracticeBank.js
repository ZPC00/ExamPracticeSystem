import React, { useState, useContext } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableRow, Typography, 
  Pagination, Tooltip, Alert, TextField, Button, Dialog, 
  DialogActions, DialogContent, DialogTitle 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PropTypes from 'prop-types';
import { AppContext } from '../AppContext';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';


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
  const { practiceBank, setPracticeBank } = useContext(AppContext);
  const [outSuccess, setOutSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingOrAdd, setIsEditingOrAdd] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [updatedInfo, setUpdatedInfo] = useState({});
  const [error, setError] = useState("");

  const itemsPerPage = 11;
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
  

  const pageCount = Math.ceil(filteredQuestion.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = filteredQuestion.slice(startIndex, endIndex);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleDeleteQuestion = (id) => {
    if (!showConfirmation) {
      setShowConfirmation("Click it again to delete");
      setTimeout(() => {
        setShowConfirmation("");
      }, 2000);
    } else {
      axios
        .post('/deletePracticeQuestion', { id })
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

  const handleUpdateQuestion = (question) => {
    setSelectedQuestion(question);
    setUpdatedInfo(question);
    setIsEditingOrAdd(true);
  };

  const handleSaveChanges = () => {
  
    // check the question exists.
    if (
      practiceBank.some(
        (question) => question.Question === updatedInfo.Question && question.id !== updatedInfo.id
      )
    ) {
      setError("Question already exists. Please choose another one.");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
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
  
    if (updatedInfo.id) {
      // update question which have id
      axios
        .post("/savePracticeQusetion", updatedInfo)
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
    } else {
      // add question which means no id
      axios
        .post("/savePracticeQusetion", updatedInfo )
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
  
  
  return (
    <div>
      <div style={{ display: 'flex', maxHeight: '100%', minWidth: '40%' }}>
        <div style={{ flex: 2, color: '#1976D2', marginLeft: '30px' }}>
          <br />
          {outSuccess && (
            <Alert variant="outlined" severity="success">
              {outSuccess}
            </Alert>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <Button onClick={() => { setSelectedQuestion(""); setUpdatedInfo({});setIsEditingOrAdd(true)}} variant="contained" sx={{ mr: 1 }}>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginLeft: "auto" }}
            />
          </div>

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
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow key={row.id} style={{ cursor: 'pointer' }}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.Question}</TableCell>
                    <TableCell>{row.A}</TableCell>
                    <TableCell>{row.B}</TableCell>
                    <TableCell>{row.C}</TableCell>
                    <TableCell>{row.D}</TableCell>
                    <TableCell>{row.E}</TableCell>
                    <TableCell>{row.correctAnswer}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.inCorrectCount}</TableCell>
                    <TableCell
                      style={{
                        display: 'flex',
                        height: '55px',
                        alignItems: 'center',
                      }}
                    >
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
                      <Tooltip title="Edit">
                        <EditIcon
                          onClick={() => handleUpdateQuestion(row)}
                          style={{ marginLeft: '10px' }}
                        />
                      </Tooltip>
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
          {selectedQuestion&&(<TextField
            label="Question ID"
            value={updatedInfo.id || ''}
            style={{ marginTop: '20px' }}
            fullWidth
            InputProps={{ readOnly: true }}
          />)}
          <Autocomplete
            disablePortal
            options={['Single Choice', 'Filling Blank', 'Multiple Choice','Judgements']}
            value={updatedInfo.type || ''}
            onChange={(event, newValue) => setUpdatedInfo({ ...updatedInfo, type: newValue })}
            style={{ marginTop: '20px' }}
            fullWidth
            renderInput={(params) => <TextField {...params} label="Type" />}
          />
          <TextField
            label="Question Title"
            value={updatedInfo.Question || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, Question: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          {(updatedInfo.type === 'Single Choice' || updatedInfo.type === 'Multiple Choice')&&(
          <div>
          <TextField
            label="A"
            value={updatedInfo.A || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, A: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <TextField
            label="B"
            value={updatedInfo.B || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, B: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <TextField
            label="C"
            value={updatedInfo.C || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, C: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <TextField
            label="D"
            value={updatedInfo.D || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, D: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <TextField
            label="E"
            value={updatedInfo.E || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, E: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          </div>
          )}
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
                fullWidth
              />
            )
          }

          {(updatedInfo.type === 'Filling Blank')&&(
          <TextField
            label="Correct Answerer"
            value={updatedInfo.correctAnswer || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, correctAnswer: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          /> )}

          {(updatedInfo.type === 'Judgements')&&(
          <Autocomplete
            disablePortal
            options={['True', 'False']}
            value={updatedInfo.correctAnswer || ''}
            onChange={(event, newValue) => setUpdatedInfo({ ...updatedInfo, correctAnswer: newValue })}
            style={{ marginTop: '20px' }}
            fullWidth
            renderInput={(params) => <TextField {...params} label="Correct Answerer" />}
          />)}

          <TextField
          label="Description"
          value={updatedInfo.description || ''}
          multiline
          onChange={(e) => setUpdatedInfo({ ...updatedInfo, description: e.target.value })}
          style={{ marginTop: '20px' }}
          fullWidth
        />

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
