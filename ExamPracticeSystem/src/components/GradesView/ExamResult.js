import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Pagination } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

function ExamResult({ examStudentGradesVisible, examStudentAnswerVisible, examPaperQuestions, attempts, examScore, totalScore }) {
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const pageCount = Math.ceil(attempts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = attempts.slice(startIndex, endIndex);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (!examStudentGradesVisible) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "950px", minWidth: "40%" }}>
      <h1 style={{ textAlign: "center", color: "#1976D2", margin: 0 }}>Result of the exam</h1>
      <br />
      <h2 style={{ textAlign: "left", margin: 0 }}>The exam result is shown below:</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", marginTop:"30px"}}>
        <h3 style={{ textAlign: "center", marginTop:"50px" }}>The exam has been submitted, and the score will be hidden according to the professor's settings.</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "950px", minWidth: "40%" }}>
      <h1 style={{ textAlign: "center", color: "#1976D2", margin: 0 }}>Result of the exam</h1>
      <br />
      <h2 style={{ textAlign: "left", margin: 0 }}>The exam result is shown below:</h2>
      {/* Statistics Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", marginTop:"30px"}}>
        <h3 style={{ flexGrow: 1, textAlign: "center", margin: 0 }}>Total Score: {totalScore}</h3>
        <h3 style={{ flexGrow: 1, textAlign: "center", margin: 0 }}>Exam Grade: {examScore}</h3>
        <h3 style={{ flexGrow: 1, textAlign: "center", margin: 0 }}>
          Correct Percent: {totalScore > 0 ? ((examScore / totalScore) * 100).toFixed(2) + "%" : "0%"}
        </h3>
      </div>

      {examStudentAnswerVisible && (
        <div>
          <br />
          {/* Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Question Index</TableCell>
                <TableCell>Question Title</TableCell>
                <TableCell>Question Type</TableCell>
                <TableCell>Correct Answer</TableCell>
                <TableCell>Exam Answer</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row, index) => {
                // Find question from exam paper
                const question = examPaperQuestions.find((q) => q.id === row.qID);

                return (
                  <TableRow key={index} style={{ cursor: "pointer" }}>
                    <TableCell>{(page - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell>{question?.Question || ""}</TableCell>
                    <TableCell>{question?.type || ""}</TableCell>
                    <TableCell>
                      {["Single Choice", "Multiple Choice"].includes(question?.type)
                        ? (question?.correctAnswer || "")
                            .split("")
                            .map((option) => question?.[option])
                            .join(", ")
                        : question?.correctAnswer || ""}
                    </TableCell>
                    <TableCell>
                      {["Single Choice", "Multiple Choice"].includes(question?.type)
                        ? (row.userAnswer || "")
                            .split("")
                            .map((option) => question?.[option])
                            .join(", ")
                        : row.userAnswer || ""}
                    </TableCell>
                    <TableCell>
                      {row.correctness ? <CheckIcon style={{ color: "green" }} /> : <ClearIcon style={{ color: "red" }} />}
                    </TableCell>
                    <TableCell>{row.score}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination count={pageCount} page={page} onChange={handleChangePage} />
        </div>
      )}
    </div>
  );
}

export default ExamResult;
