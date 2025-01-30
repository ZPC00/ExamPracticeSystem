import React, { createContext, useState,useEffect } from 'react';
import axios from 'axios';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [userAccount, setUserAccount] = useState([]); 
    const [username, setUsername] = useState('');
    const [functs, setfuncts] = useState('');


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

    return (
        <AppContext.Provider value={{ userAccount, setUserAccount, username, setUsername, functs, setfuncts }}>
            {children}
        </AppContext.Provider>
    );
};
