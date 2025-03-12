import React, { useState, useEffect, useContext } from 'react';
import { 
  Toolbar, Button, Typography, Modal, Box, TextField, 
  Autocomplete, Stack, Alert, Avatar, Tooltip
} from '@mui/material';
import { AppContext } from '../AppContext';
import axios from 'axios';
import ForgetPassword from './forgetPassword'
import HomePage from '../HomePage';

//difine the user roles
const user_roles = [
  { label: 'Teacher' },
  { label: 'Student' },
  { label: 'Administrator' },
];

// Modal style
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function Account() {
  // Context for user account 
  const { username, setUsername, setfuncts } = useContext(AppContext);
 // the state of the modules
  const [open, setOpen] = useState(false);
  //set for log in
  const [loginid, setLoginid] = useState('');
  const [loginrole, setLoginrole] = React.useState('');
  // set fot alert messages
  const [showSuccessAlert, setShowSuccessAlert] = useState('');
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState('');

  //loading the log in informaion from local storage 
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedLoginrole = localStorage.getItem('loginrole');
    const storedLoginid = localStorage.getItem('loginid');
    if (storedUsername && storedLoginrole) {
      setUsername(storedUsername);
      setLoginrole(storedLoginrole);
      setLoginid(storedLoginid);
    }
  }, [setUsername, setLoginrole, setLoginid]);
  
  //set the log in informaion to local storage 
  useEffect(() => {
    localStorage.setItem('username', username);
    localStorage.setItem('loginrole', loginrole);
    localStorage.setItem('loginid', loginid);
  }, [username, loginrole, loginid]);
  
  //log in or open informaion by checking the username
  const handleOpen = () => {
    if (username === '') {
      setOpen(true);
  }};
 
  const handleClose = () => {
    setOpen(false);
    setError('');
    setShowSuccessAlert('')
    setShowConfirmation(false);
  };

  //log in check
  const handleAuth = () => {
    const userName = document.getElementById('UserName').value;
    const password = document.getElementById('Password').value;
    const selectedUserRole = document.getElementById('combo-box-demo').value;
    handleLogin(userName, password, selectedUserRole);
  };


  //handle log in and storage the login in information to local storage.
  const handleLogin = async (userName, password, selectedUserRole) => {
  try {
    await axios
    .post("https://exampracticesystem-backend.onrender.com/getPracticeBank/login", { userName,password,selectedUserRole })
    .then((response) => {
      localStorage.setItem("username", response.data.user.username);
      localStorage.setItem("loginrole", response.data.user.role);
      localStorage.setItem("loginid", response.data.user.id);

      setLoginrole(response.data.user.role);
      setUsername(response.data.user.username);
      setLoginid(response.data.user.id);

      setShowSuccessAlert(response.data.message);
      setTimeout(() => {
        handleClose();
      }, 1000);
    })
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("Server error");
        }
    setTimeout(() => setError(""), 3000);
  }
};


  //handle logou and remove from the local storage. we need to double click the buttun to log out
  const handleLogout = () => {
    if (!showConfirmation) {
      setShowConfirmation("click log out button again to comfim leave!");
      setTimeout(() => {
        setShowConfirmation("")
      }, 2000);
    } else {
      setUsername('');
      setLoginrole('');
      localStorage.removeItem('username');
      localStorage.removeItem('loginrole');
      localStorage.removeItem('loginid');
      setShowConfirmation("");
      setfuncts(<HomePage/>)
    }
  };

  return (
    <React.Fragment>
      <Toolbar>

        {/*Avatar for displaying the login user name*/}         
        <Avatar
          sx={{ bgcolor: "#d84315" }}
          alt={username}
          src="/broken-image.jpg"
        />

        {/*log in or display the log in user name and id*/}  
        <Button onClick={handleOpen} sx={{ color: 'white', textDecoration: username !== "" ? 'underline' : 'none' }}>{username === "" ? "Log in" : `${username}(id:${loginid})`}</Button>
        <Tooltip title={
          <span style={{ fontSize: '15px' }}>
          {showConfirmation ? "click it again to log out" : "double click to log out"}
          </span>}
          >
           <Button onClick={handleLogout} sx={{ color: 'white', textDecoration:'underline', display: username !== "" ? 'flex' : 'none' }}>Log out</Button>
        </Tooltip>
   
        {/*log in modal*/}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...style}}>
            <Typography id="modal-modal-title" variant="h6" component="h2" textAlign='center'>
              Log in
            </Typography>
            <br />
            <Typography>Account Role:</Typography>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={user_roles}
                defaultValue={{ label: 'Student' }}
                sx={{ width: '100%' }}
                renderInput={(params) => <TextField {...params} />}
              />
            <Typography>User Name:</Typography>
              <Box
                component="form"
                sx={{
                  '& > :not(style)': { width: '100%' },
                }}
                noValidate
                autoComplete="off">   
                <TextField id={"UserName"} variant="outlined" />
              </Box>

            <Typography>Password:</Typography>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { width: '100%' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField id={"Password"} variant="outlined" type="password" />
            </Box>
            <br/>
              {/* add forget password module*/}
            <ForgetPassword/>

            <br/>
            
            {/*error message for the username exist for registering or other issues*/}
            {error && ( <Alert variant="outlined" severity="error">   {error}   </Alert> )}

            {/*success message*/}
               {showSuccessAlert && ( <Alert variant="outlined" severity="success">   {showSuccessAlert}   </Alert> )}
            <br/>

            <Stack spacing={2} direction="row" justifyContent="center">
              <Button variant="contained" onClick={handleAuth}>
                {"Log in"}
              </Button>
              <Button onClick={handleClose} variant="contained" color="grey">Cancel</Button>
            </Stack>
          </Box>
        </Modal>
      </Toolbar>
    </React.Fragment>
  );
}

export default Account;