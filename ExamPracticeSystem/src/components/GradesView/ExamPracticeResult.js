import React, { useState, useContext } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Pagination, IconButton, Dialog } from '@mui/material';
import { AppContext } from '../AppContext';
import { Check as CheckIcon, Clear as ClearIcon, ImageOutlined as ImageOutlinedIcon} from '@mui/icons-material';


function ExamPracticeResult({ attempts, PracticeScore }) {
  const { practiceBank } = useContext(AppContext);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const pageCount = Math.ceil(attempts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = attempts.slice(startIndex, endIndex);

  // the function to change the page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // view detail of the image
  const [viewImage, setViewImage] = useState(null)
  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '880px' ,minWidth: '40%' }}>
      <h1 style={{ textAlign: "center", color: '#1976D2',margin: 0 }}>Mock Exam Result</h1>
      <br/>
      {/* Statistics Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
        }}>
        <h3 style={{ flexGrow: 1, textAlign: "center", margin: 0 }}>
          Total Score: {attempts.length}
        </h3>
        <h3 style={{ flexGrow: 1, textAlign: "center", margin: 0 }}>
          Your Grade: {PracticeScore}
        </h3>
        <h3 style={{ flexGrow: 1, textAlign: "center", margin: 0 }}>
          Correct Percent: {attempts.length > 0 ? ((PracticeScore / attempts.length) * 100).toFixed(2) + "%" : "0%"}     {/*caculate the correct percent*/}
        </h3>
      </div>
      <br/>

      {/* Table */}
      <Table size="large">
        <TableHead>
          <TableRow>
            <TableCell>Question Index</TableCell>
            <TableCell>Question Title</TableCell>
            <TableCell>Question Type</TableCell>
            <TableCell>Correct Answer</TableCell>
            <TableCell>Your Answer</TableCell>
            <TableCell>Result</TableCell>
            <TableCell>Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRows.map((row, index) => {
            // Find question from practice bank
            const question = practiceBank.find(q => q.id === row.qID);

            return (
              <TableRow key={index} style={{ cursor: 'pointer' }}>
                <TableCell>{(page - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>
                    {question?.image && (
                      <>
                        <IconButton onClick={() => setViewImage(question.image)}>
                          <ImageOutlinedIcon />
                        </IconButton>
                      </>
                    )}{question?.Question || "The question has been deleted !"}
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

                <TableCell>{question.type || ""}</TableCell>
                <TableCell>
                  {["Single Choice", "Multiple Choice"].includes(question.type)
                    ? question.correctAnswer.split("").map(option => question[option]).join(", ") // Display detailed answer choices
                    : question.correctAnswer}
                </TableCell>
                <TableCell>
                {["Single Choice", "Multiple Choice"].includes(question.type)
                    ? row.userAnswer.split("").map(option => question[option]).join(", ") // Display detailed answer choices
                    : row.userAnswer}
                </TableCell>
                <TableCell>
                  {row.correctness ? (<CheckIcon style={{ color: "green" }} />) : (<ClearIcon style={{ color: "red" }}/>)}
                </TableCell>

                <TableCell>{row.correctness? "1":"0"}</TableCell>    {/*each question 1 point*/}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination count={pageCount} page={page} onChange={handleChangePage} />
    </div>
  );
}

export default ExamPracticeResult;
