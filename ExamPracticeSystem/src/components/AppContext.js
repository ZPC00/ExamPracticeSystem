import React, { createContext, useState,useEffect } from 'react';
import axios from 'axios';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [username, setUsername] = useState('');      //log in current user
    const [userAccount, setUserAccount] = useState([]);    // user list
    const [practiceBank, setPracticeBank] = useState([]);  // practice bank
    const [functs, setfuncts] = useState('');     // for changing display page
   

    //load the user account from back end service
    useEffect(() => {
      axios.get('/userAccount')
          .then(response => {
            setUserAccount(response.data);
            })
          .catch(error => {
              console.error('Error fetching product data:', error);
            });
    }, []);

    //load the practice question from back end service
    useEffect(() => {
      axios.get('/getPracticeBank')
          .then(response => {
            setPracticeBank(response.data);
            })
          .catch(error => {
            console.error('Error fetching product data:', error);
          });
        }, []);
    
    
    

    return (
        <AppContext.Provider value={{ userAccount, setUserAccount, username, setUsername, functs, setfuncts, practiceBank, setPracticeBank }}>
            {children}
        </AppContext.Provider>
    );
};
