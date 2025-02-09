import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Paper from '@mui/material/Paper';
import { useContext } from 'react';
import { AppContext } from './AppContext';


export default function Content() {
  // import global variables for change display page
  const { functs} = useContext(AppContext);


  return (
    <Paper sx={{ maxWidth: 1300, margin: 'auto', overflow: 'hidden' }}>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
      {/* change display page */}
      <div style={{padding: '10px 20px'}}>
        {functs}
      </div>

    </AppBar>
    </Paper>
  );
}
