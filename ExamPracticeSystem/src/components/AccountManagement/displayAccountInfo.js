import React, { useContext, useState } from 'react';
import { 
  Tooltip, Alert, TextField, Button, Dialog, Typography, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { AppContext } from '../AppContext';
import axios from 'axios';

function DisplayAccountInfo() {
  // Context for user account management
  const { username, userAccount, setUserAccount } = useContext(AppContext);
  
  // Find current user information based on username
  const currentUserInfo = userAccount.find(user => user.name === username);

  // State for updating password
  const [updatePassword, setUpdatePassword] = useState(false);
  const [updatePasswordInfo, setUpdatePasswordInfo] = useState({});

  // State for success or error message
  const [outSuccess, setOutSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Function to handle saving updated password
  const handleSaveChanges = async () => {
    // Set user ID in updatePasswordInfo
    setUpdatePasswordInfo(prev => ({ ...prev, id: currentUserInfo.id }));

    // Validate required fields
    if (!updatePasswordInfo.oldPassword || !updatePasswordInfo.newPassword1 || !updatePasswordInfo.newPassword2) {
      setError("All fields are required.");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }

    // add user id to match
    const passwordData = {
      id: currentUserInfo.id, // id
      oldPassword: updatePasswordInfo.oldPassword,
      newPassword1: updatePasswordInfo.newPassword1,
      newPassword2: updatePasswordInfo.newPassword2,
    };

    try {
      await axios
      .post("/updatePassword", passwordData )
      .then((response) => {
        setUserAccount(response.data.updatedUserAccount);
        setOutSuccess(response.data.message);       
        setTimeout(() => {
          setOutSuccess("");
        }, 3000);
        setUpdatePassword(false);
        setUpdatePasswordInfo({});
      })
    } catch(error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        console.error("Change password error:", error);
      }
      setTimeout(() => setError(""), 3000);
    }
  };
  
  // Function to sum user grades
  const Sum = (grades) => {
    return grades.reduce((acc, grade) => acc + grade, 0);
  };

  return (
    <React.Fragment>
      {/*user information modal*/}
      {currentUserInfo && (
        <div>
          {outSuccess && (
            <Alert variant="outlined" severity="success">
              {outSuccess}
            </Alert>
          )}

          {/* Display user details */}
          <h1 style={{ flexGrow: 1, textAlign: "center", color: '#1976D2', margin: 0 }}>
              User Information
          </h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>User ID:</h4>
            <Typography>{currentUserInfo.id}</Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>Frist Name:</h4>
            <Typography>{currentUserInfo.firstname}</Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>Last Name:</h4>
            <Typography>{currentUserInfo.lastname}</Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>E-mail:</h4>
            <Typography>{currentUserInfo.email}</Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>User Account:</h4>
            <Typography>{currentUserInfo.name}</Typography>
          </div>

          {/* Update Password module */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>Password:</h4>
            <Tooltip title="Edit">
                <EditIcon
                  onClick={() =>{setUpdatePassword(true)}}
                  style={{ marginLeft: '10px' }}
                />
            </Tooltip>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>User Role:</h4>
            <Typography>{currentUserInfo.Loginrole}</Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>Practice Sum Scores:</h4>
            <Typography>
              {Sum(currentUserInfo.practiceGradesList)}
            </Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>Practice Counts:</h4>
            <Typography>
              {currentUserInfo.practiceGradesList.length}
            </Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>Practice Average Scores:</h4>
            <Typography>
              {currentUserInfo.practiceGradesList.length? (Sum(currentUserInfo.practiceGradesList)/currentUserInfo.practiceGradesList.length).toFixed(2):0}
            </Typography>
          </div>
          <br />

      {/* Update Password Dialog */}
      <Dialog open={updatePassword} onClose={() => setUpdatePassword(false)}>
        <DialogTitle>{ "Update Password" }</DialogTitle>
        <DialogContent>
          {currentUserInfo&&(<TextField
            label="User Name"
            value={currentUserInfo.name || ''}
            style={{ marginTop: '20px' }}
            fullWidth
            InputProps={{ readOnly: true }}
          />)}
          <TextField
            label="Old Password"
            type="password"
            value={updatePasswordInfo.oldPassword || ''}
            onChange={(e) => setUpdatePasswordInfo({ ...updatePasswordInfo, oldPassword: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <TextField
            label="New Password"
            type="password"
            value={updatePasswordInfo.newPassword1 || ''}
            onChange={(e) => setUpdatePasswordInfo({ ...updatePasswordInfo, newPassword1: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          <TextField
            label="Repeat New Password"
            type="password"
            value={updatePasswordInfo.newPassword2 || ''}
            onChange={(e) => setUpdatePasswordInfo({ ...updatePasswordInfo, newPassword2: e.target.value })}
            style={{ marginTop: '20px' }}
            fullWidth
          />
          {/* Error message in update password dialog */}
          {error && (
          <div>
            <br />
              <Alert variant="outlined" severity="error">
               {error}
            </Alert>
          </div>
        )}
        </DialogContent>
        <DialogActions>
        <Button onClick={() => { setUpdatePassword(false);setUpdatePasswordInfo({})}}>Cancel</Button>

          <Button onClick={handleSaveChanges} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
        </div>
      )}
    </React.Fragment>
  );
}

export default DisplayAccountInfo;
