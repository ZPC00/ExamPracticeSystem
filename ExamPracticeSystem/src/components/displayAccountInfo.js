import React, { useContext, useState } from 'react';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import { 
  Tooltip, Alert, TextField, Button, Dialog, 
  DialogActions, DialogContent, DialogTitle 
} from '@mui/material';
import { AppContext } from './AppContext';
import axios from 'axios';

function DisplayAccountInfo() {
  //import global variables
  const { username, userAccount, setUserAccount } = useContext(AppContext);
  const currentUserInfo = userAccount.find(user => user.name === username);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [outSuccess, setOutSuccess] = useState('');
  const [error, setError] = useState('');
  const [updatePasswordInfo, setUpdatePasswordInfo] = useState({});
  
  const handleSaveChanges = () => {
    setUpdatePasswordInfo({ ...updatePasswordInfo, id: currentUserInfo.id })
    if (!updatePasswordInfo.oldPassword || !updatePasswordInfo.newPassword1 || !updatePasswordInfo.newPassword2) {
      setError("All fields are required.");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
    if (updatePasswordInfo.newPassword1 !== updatePasswordInfo.newPassword2) {
      setError("Two new passwords do not the same.");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }

    if (updatePasswordInfo.oldPassword !== currentUserInfo.password) {
      setError("Old password is incorrect.");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }

    if (updatePasswordInfo.oldPassword === updatePasswordInfo.newPassword1) {
      setError("New password is the same as the old password");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
      // add user which means no id
    axios
      .post("/updatePassword", updatePasswordInfo )
      .then((response) => {
        setUserAccount(response.data.updatedUserAccount);
        setOutSuccess(response.data.message);          
        setTimeout(() => {
          setOutSuccess("");
        }, 3000);
        setUpdatePassword(false);
        setUpdatePasswordInfo({});
      })
      .catch((error) => {
        console.error("Error adding user:", error);
    });
  };
  
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
          <Typography id="modal-modal-title" variant="h6" component="h2" textAlign="center" fontWeight="bold">
            User Information
          </Typography>
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
            <h4 style={{ marginRight: '8px' }}>Quiz Sum Scores:</h4>
            <Typography>
              {Sum(currentUserInfo.Grade)}
            </Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>Quiz Counts:</h4>
            <Typography>
              {currentUserInfo.Grade.length}
            </Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>Quiz Average Scores:</h4>
            <Typography>
              {currentUserInfo.Grade.length? Sum(currentUserInfo.Grade)/currentUserInfo.Grade.length:0}
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
        </DialogContent>
        {error && (
          <Alert variant="outlined" severity="error">
            {error}
          </Alert>
        )}
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
