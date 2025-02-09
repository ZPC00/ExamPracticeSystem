import React, { useState, useContext } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Pagination, Tooltip, 
  Alert, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete 
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { AppContext } from '../AppContext';
import axios from 'axios';



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

function AccountMangement() {
  // Context for user account management
  const { userAccount, setUserAccount } = useContext(AppContext);
  // Success or error message
  const [error, setError] = useState("");
  const [outSuccess, setOutSuccess] = useState(null);

  // confirmation feature
  const [showConfirmation, setShowConfirmation] = useState("");

  // Edit account
  const [isEditingOrAdd, setIsEditingOrAdd] = useState(false);
  const [selectUser, setSelectUser] = useState("");
  const [updatedInfo, setUpdatedInfo] = useState({});

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = userAccount.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Loginrole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 11;
  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = filteredUsers.slice(startIndex, endIndex);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

   // Handle user deletion with confirmation
  const handleDeleteUser = (userName) => {
    if (!showConfirmation) {
      setShowConfirmation("Click it again to delete");
      setTimeout(() => {
        setShowConfirmation("");
      }, 2000);
    } else {
      axios
        .post('/deleteUser', { userName })
        .then((response) => {
          setUserAccount(response.data.updatedUserAccount);
          setOutSuccess(response.data.message);
          setTimeout(() => {
            setOutSuccess("");
          }, 3000);
          setIsEditingOrAdd(false);
          setUpdatedInfo({});
          setSelectUser("")
        })
        .catch((error) => {
          console.error('Error deleting user:', error);
        });
    }
  };

  // Handle user edit by setting selected user info
  const handleUpdateUser = (user) => {
    setSelectUser(user);
    setUpdatedInfo(user);
    setIsEditingOrAdd(true);
  };

  // Handle saving user changes (both add and update operations)
  const handleSaveChanges = () => {
    // check the user name exists.
    if (
      userAccount.some(
        (user) => user.name === updatedInfo.name && user.id !== updatedInfo.id
      )
    ) {
      setError("Username already exists. Please choose another one.");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
    // Validate required fields
    if (
      !(updatedInfo.name && updatedInfo.lastname && updatedInfo.firstname && updatedInfo.email && updatedInfo.password && updatedInfo.Loginrole)
      )
     {
      setError("All the information required.");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
    
    // If user has an ID, update existing user, otherwise add new user
    if (updatedInfo.id) {
      // update user which have id
      axios
        .post("/saveUser", updatedInfo)
        .then((response) => {
          setUserAccount(response.data.updatedUserAccount);
          setOutSuccess(response.data.message);
          setTimeout(() => {
            setOutSuccess("");
          }, 3000);
          setIsEditingOrAdd(false);
          setUpdatedInfo({});
          setSelectUser("")
        })
        .catch((error) => {
          console.error("Error updating user:", error);
        });
    } else {
      // add user which means no id
      axios
        .post("/saveUser", updatedInfo )
        .then((response) => {
          setUserAccount(response.data.updatedUserAccount);
          setOutSuccess(response.data.message);
          setTimeout(() => {
            setOutSuccess("");
          }, 3000);
          setIsEditingOrAdd(false);
          setUpdatedInfo({});
          setSelectUser("")
        })
        .catch((error) => {
          console.error("Error adding user:", error);
        });
    }
  };
  
  
  return (
    <div>
      <div style={{ display: 'flex', maxHeight: '100%', minWidth: '40%' }}>
        <div style={{ flex: 2, color: '#1976D2', marginLeft: '30px' }}>
          <br />
          {/* Success message */}
          {outSuccess && (
            <Alert variant="outlined" severity="success">
              {outSuccess}
            </Alert>
          )}

          {/* User management header and search */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <Button onClick={() => { setSelectUser(""); setUpdatedInfo({});setIsEditingOrAdd(true)}} variant="contained" sx={{ mr: 1 }}>
              Add User
            </Button>
            <h1 style={{ flexGrow: 1, textAlign: "center", margin: 0 }}>
              User Management
            </h1>
            <TextField
              label="Filter Users"
              variant="standard"
              margin="normal"
              value={searchTerm}
              onChange={(e) => {setPage(1);setSearchTerm(e.target.value)}}
              style={{ marginLeft: "auto" }}
            />
          </div>
           {/* User table with pagination */}
          {paginatedRows.length > 0 ? (
            <Table size="large">
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>User Name</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Login Role</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow key={row.id} style={{ cursor: 'pointer' }}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.firstname}</TableCell>
                    <TableCell>{row.lastname}</TableCell>
                    <TableCell>{row.Loginrole}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Tooltip
                        title={
                          showConfirmation ? "Click it again to delete" : "Double click to delete"
                        }
                      >
                        <DeleteIcon
                          onClick={() => handleDeleteUser(row.name)}
                          size="small"
                        />
                      </Tooltip>
                      <Tooltip title="Edit">
                        <EditIcon
                          onClick={() => handleUpdateUser(row)}
                          style={{ marginLeft: '10px' }}
                        />
                      </Tooltip>
                      </div>
                    </TableCell>
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

      {/* Add or Edit Dialog */}
      <Dialog open={isEditingOrAdd} onClose={() => setIsEditingOrAdd(false)}>
        <DialogTitle>{selectUser ? "Edit User Information" : "Add New User"}</DialogTitle>
        <DialogContent>
          {selectUser&&(<TextField
            label="User ID"
            value={updatedInfo.id || ''}
            style={{ marginTop: '20px' }}
            fullWidth
            InputProps={{ readOnly: true }}
          />)}
          <TextField
            label="User Name"
            value={updatedInfo.name || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, name: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={updatedInfo.password || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, password: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <TextField
            label="First Name"
            value={updatedInfo.firstname || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, firstname: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <TextField
            label="Last Name"
            value={updatedInfo.lastname || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, lastname: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <Autocomplete
            disablePortal
            options={['Student', 'Teacher', 'Administrator']}
            value={updatedInfo.Loginrole || ''}
            onChange={(event, newValue) => setUpdatedInfo({ ...updatedInfo, Loginrole: newValue })}
            style={{ marginTop: '20px' }}
            fullWidth
            renderInput={(params) => <TextField {...params} label="Login Role" />}
          />
          <TextField
            label="E-mail"
            value={updatedInfo.email || ''}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, email: e.target.value })}
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
        <Button onClick={() => { setIsEditingOrAdd(false);setUpdatedInfo({});setSelectUser("")}}>Cancel</Button>

          <Button onClick={handleSaveChanges} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AccountMangement;
