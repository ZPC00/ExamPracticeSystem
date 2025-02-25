import React, { useState, useContext } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Pagination, TextField, TableSortLabel } from '@mui/material';
import PropTypes from 'prop-types';
import { AppContext } from '../AppContext';

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

function PracticeGrades() {
  // Context for user account 
  const { userAccount } = useContext(AppContext);

  // search items
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = userAccount.filter(
    (user) =>
      user.Loginrole === "Student"  &&                      // only display the students' grades
    ( user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

    // Function to sum user grades
    const Sum = (grades) => {
      return grades.reduce((acc, grade) => acc + grade, 0);
    };

  //state for sortting the item
  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  // sort the items
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valueA, valueB;
    if (sortBy === "sum") {
      valueA = Sum(a.practiceGradesList);
      valueB = Sum(b.practiceGradesList);
    } else if (sortBy === "count") {
      valueA = a.practiceGradesList.length;
      valueB = b.practiceGradesList.length;
    } else if (sortBy === "average") {
      valueA = a.practiceGradesList.length ? Sum(a.practiceGradesList) / a.practiceGradesList.length : 0;
      valueB = b.practiceGradesList.length ? Sum(b.practiceGradesList) / b.practiceGradesList.length : 0;
    } else {
      valueA = a[sortBy];
      valueB = b[sortBy];
    }

    if (typeof valueA === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
  const handleSort = (column) => {
    const isAsc = sortBy === column && sortDirection === "asc";
    setSortBy(column);
    setSortDirection(isAsc ? "desc" : "asc");
  };

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const pageCount = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = sortedUsers.slice(startIndex, endIndex);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      <div style={{ display: 'flex', maxHeight: '100%', minWidth: '40%' }}>
        <div style={{ flex: 2, color: '#1976D2', marginLeft: '30px' }}>
          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
            }}>
            <h1 style={{ flexGrow: 1, textAlign: "center", margin: 0 }}>
              User Practice Exam Grades
            </h1>
            <TextField
              label="Filter Users"
              variant="standard"
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginLeft: "auto" }}/>
          </div>
          
          {/* Table for displaying user practice grades */}
          {paginatedRows.length > 0 ? (
            <Table size="large">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "id"}
                      direction={sortBy === "id" ? sortDirection : "asc"}
                      onClick={() => handleSort("id")}>
                      User ID
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "name"}
                      direction={sortBy === "name" ? sortDirection : "asc"}
                      onClick={() => handleSort("name")}>
                      User Name
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "firstname"}
                      direction={sortBy === "firstname" ? sortDirection : "asc"}
                      onClick={() => handleSort("firstname")}>
                      First Name
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "lastname"}
                      direction={sortBy === "lastname" ? sortDirection : "asc"}
                      onClick={() => handleSort("lastname")}>
                      Last Name
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "sum"}
                      direction={sortBy === "sum" ? sortDirection : "asc"}
                      onClick={() => handleSort("sum")}>
                      Practice Sum Scores
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "count"}
                      direction={sortBy === "count" ? sortDirection : "asc"}
                      onClick={() => handleSort("count")}>
                      Practice Counts
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "average"}
                      direction={sortBy === "average" ? sortDirection : "asc"}
                      onClick={() => handleSort("average")} >
                      Practice Average Scores
                    </TableSortLabel>
                  </TableCell>

                </TableRow>
              </TableHead>
              
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow key={row.id} style={{ cursor: 'pointer' }}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.firstname}</TableCell>
                    <TableCell>{row.lastname}</TableCell>
                    <TableCell>{Sum(row.practiceGradesList)}</TableCell>
                    <TableCell>{row.practiceGradesList.length}</TableCell>
                    <TableCell>{row.practiceGradesList.length ? (Sum(row.practiceGradesList) / row.practiceGradesList.length).toFixed(2) : 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div>
              <br /> <br /> <br />
              <div style={{ fontSize: '1.2em' }}>No Users available.</div>
            </div>
          )}
          <Pagination count={pageCount} page={page} onChange={handleChangePage} />
        </div>
      </div>
    </div>
  );
}

export default PracticeGrades;