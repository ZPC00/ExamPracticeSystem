import React, { createContext, useState,useEffect } from 'react';
import axios from 'axios';
import HomePage from './HomePage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [username, setUsername] = useState('');                        // log in current user
    const [currentUserInfor, setCurrentUserInfor] = useState({});       // user informations

    const [practiceBank, setPracticeBank] = useState([]);              // practice bank
    const [examRuningState, setExamRuningState] = useState(false);    // for exam jump out

    const [functs, setfuncts] = useState(<HomePage/>);               // for changing display page



    //load the current user information from back end service
    useEffect(() => {
      axios.post('https://exampracticesystem-backend.onrender.com/matchUserInfo',{username:username})
         .then(response => {
          if(response.data.matchUser){
              setCurrentUserInfor(response.data.matchUser);
            }})
          .catch(error => {
              console.error('Error fetching product data:', error);
              setCurrentUserInfor({})
            });
    }, [username]);
  
    //load the practice question from back end service
    useEffect(() => {
      axios.get('https://exampracticesystem-backend.onrender.com/getPracticeBank')
          .then(response => {
            setPracticeBank(response.data);
            })
          .catch(error => {
            console.error('Error fetching product data:', error);
          });
        }, []);

    return (
        <AppContext.Provider value={{ username, setUsername, functs, setfuncts, practiceBank, setPracticeBank, examRuningState, setExamRuningState, currentUserInfor, setCurrentUserInfor }}>
            {children}
        </AppContext.Provider>
    );
};
