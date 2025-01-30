import React, { useState, useContext } from "react";
import { Typography, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert } from "@mui/material";
import PropTypes from "prop-types";
import { AppContext } from "./AppContext";
import axios from 'axios';

function ForgetPassword() {
  const [open, setOpen] = useState(false);
  const [forgetPassword1, setForgetPassword1] = useState("");
  const [forgetPassword2, setForgetPassword2] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetPasswordState, setResetPasswordState] = useState(false);
  const [randomNo, setRandomNo] = useState("");
  const [updatePasswordInfo, setUpdatePasswordInfo] = useState({});
  const { userAccount,setUserAccount } = useContext(AppContext);

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setError("");
    setSuccessMessage("");
    setForgetPassword1("");
    setForgetPassword2("");
    setResetCode("");
    setResetPasswordState(false);
  };

  const handleContinue = async () => {
    if (!forgetPassword1 || !forgetPassword2) {
      setError("Both fields are required!");
      setTimeout(() => setError(""), 3000);
      return;
    }

  const matchedUser = userAccount.find(
      (user) => user.name === forgetPassword1 && user.email === forgetPassword2
    );

    if (matchedUser) {
      setUpdatePasswordInfo({...updatePasswordInfo, id: matchedUser.id })
      setForgetPassword1("");
      setForgetPassword2("");
      setResetPasswordState(true);
      const randomNo = Math.floor(100000 + Math.random() * 900000);
      setRandomNo(randomNo);
      setTimeout(() => {
        alert(`Assume Generated Reset Number: ${randomNo}`);
      }, 500);
    } else {
      setError("User not found or email does not match.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleReset = async () => {
    if (String(resetCode) !== String(randomNo)) {
      setError("Reset code incorrect");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (forgetPassword1 !== forgetPassword2) {
      setError("Two new passwords do not match.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setUpdatePasswordInfo(prevState => ({
      ...prevState,
      oldPassword: "",
      newPassword1: forgetPassword1,
      newPassword2: forgetPassword2
    }));

    setTimeout(() =>     
    axios
    .post("/updatePassword", updatePasswordInfo )
    .then((response) => {
      setUserAccount(response.data.updatedUserAccount);
      setSuccessMessage("Password reset successful!");          
      setTimeout(() => {
        setSuccessMessage("");
        handleClose()
      }, 3000);
    })
    .catch((error) => {
      console.error("Error adding user:", error);
  }), 500);


    console.log(updatePasswordInfo)

    
  };

  return (
    <div>
      <Typography
        variant="body2"
        color="primary"
        sx={{ mt: 2, textAlign: "center", cursor: "pointer" }}
        onClick={() => { setOpen(true); resetForm(); }}
      >
        Forget the password?
      </Typography>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <DialogContentText>
            {resetPasswordState
              ? "Your account information matches. Please input your new password."
              : "Enter your account's username and email address to get reset code."}
          </DialogContentText>

          <TextField
            label={resetPasswordState ? "Input New Password" : "User Name"}
            value={forgetPassword1}
            onChange={(e) => setForgetPassword1(e.target.value)}
            style={{ marginTop: "20px" }}
            type={resetPasswordState ? "password" : "text"}
            fullWidth
          />

          <TextField
            label={resetPasswordState ? "Input New Password again" : "E-mail"}
            value={forgetPassword2}
            onChange={(e) => setForgetPassword2(e.target.value)}
            style={{ marginTop: "20px" }}
            type={resetPasswordState ? "password" : "text"}
            fullWidth
          />

          {resetPasswordState && (
            <TextField
              label={"Reset Code"}
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              style={{ marginTop: "20px" }}
              type={"text"}
              fullWidth
            />
          )}

          {error && <Typography color="error">{error}</Typography>}
          {successMessage && (<Alert variant="outlined" severity="success">{successMessage}</Alert>)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={resetPasswordState ? handleReset : handleContinue}>
            {resetPasswordState ? "Reset" : "Continue"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

ForgetPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgetPassword;
