import React, { useState, useEffect, useContext } from 'react';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { AppContext } from './AppContext';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import ForgetPassword from './forgetPassword'

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
  //import global variables
  const { userAccount, username, setUsername } = useContext(AppContext);
 // the state of the modules
  const [open, setOpen] = useState(false);
  const [openuserinfo, setOpenuserinfo] = useState('');
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
    } else {
      handleUserInfoOpen();
    }
  };
 
  const handleClose = () => {
    setOpen(false);
    setError('');
    setShowSuccessAlert('')
    setShowConfirmation(false);
  };

  //log in 
  const handleAuth = () => {
    const userName = document.getElementById('UserName').value;
    const password = document.getElementById('Password').value;
    const selectedUserRole = document.getElementById('combo-box-demo').value;
    handleLogin(userName, password, selectedUserRole);
  };


  //handle log in and storage the login in information to local storage.
  const handleLogin = (userName, password, selectedUserRole) => {
    const matchedUser = userAccount.find(user => user.name === userName && user.password === password && user.Loginrole === selectedUserRole);
    if (matchedUser) {
      setError('');
      setLoginrole(selectedUserRole);
      setUsername(userName);
      setLoginid(matchedUser.id);
      localStorage.setItem('username', userName);
      localStorage.setItem('loginrole', selectedUserRole);
      localStorage.setItem('loginid', matchedUser.id);
      setShowSuccessAlert('Log in success.')
      setTimeout(() => {
        handleClose();
      }, 1000);
    } else {
      setError('Username, password, role is invalid !');
      setTimeout(() => {
        setError('');
      }, 3000);
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
      setOpenuserinfo(false);
      setShowConfirmation("");
    }
  };

    //the function for open/close the interface of user informations.
    const handleUserInfoOpen = () => {
      setOpenuserinfo(true);
    };

    const handleUserInfoClose = () => {
      setOpenuserinfo(false);
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
            
            <React.Fragment>
              <Typography>Account Role:</Typography>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={user_roles}
                  defaultValue={{ label: 'Student' }}
                  sx={{ width: '100%' }}
                  renderInput={(params) => <TextField {...params} />}
                />
              
            </React.Fragment>

            <Typography>User Name:</Typography>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { width: '100%' },
              }}
              noValidate
              autoComplete="off"
            >
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

        {/*user information modal.*/}
        <Modal
          open={openuserinfo}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...style, width: '800px' }}>
            <Typography id="modal-modal-title" variant="h6" component="h2" textAlign='center' fontWeight="bold">
              User Information
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h4 style={{ marginRight: '8px' }}>User ID:   </h4> 
              <Typography>  {loginid}</Typography>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h4 style={{ marginRight: '8px' }}>User Account:   </h4> 
              <Typography>  {username}</Typography>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
               <h4 style={{ marginRight: '8px' }}>User Role:   </h4>  
               <Typography> {loginrole}</Typography>
            </div>


            {/*comfirm message*/}
            <br/>
            {showConfirmation &&( <Alert variant="outlined" severity="info">{showConfirmation}</Alert>)}
            
            {/*success message*/}
            {showSuccessAlert && ( <Alert variant="outlined" severity="success"> {showSuccessAlert}</Alert> )}  
            <br />
            <Stack spacing={2} direction="row" justifyContent="center">
              <Button onClick={handleUserInfoClose} variant="contained" color="grey">Close</Button>
            </Stack>

          </Box>
        </Modal>
      </Toolbar>
    </React.Fragment>
  );
}

export default Account;