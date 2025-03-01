import * as React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Grid, IconButton, Link, Toolbar, Tooltip, Typography } from '@mui/material';
import { Help as HelpIcon, Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useContext } from 'react';
import { AppContext } from './AppContext';
import Account from './AccountManagement/Account';

const lightColor = 'rgba(255, 255, 255, 0.7)';

function Header(props) {
  const { onDrawerToggle } = props;

  // Context for user account and functs
  const { username, userAccount } = useContext(AppContext);

  // current user role
  const currentUserRole = userAccount.find(user => user.name === username)?.Loginrole;

  return (
    <React.Fragment>

      {/* Top navigation bar */}
      <AppBar color="primary" position="sticky" elevation={0}>
        <Toolbar>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid sx={{ display: { sm: 'none', xs: 'block' } }} item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={onDrawerToggle}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            </Grid>

          {/* Documentation link */}
          <Grid item xs />
            <Grid item>
            {currentUserRole==="Teacher"&&(
              <Link
                href="http://localhost:3030/files/QuestionUploadTemplate.xlsx"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  color: lightColor,
                  '&:hover': {
                    color: 'common.white',
                  },
                }}
                rel="noopener noreferrer"
                target="_blank"
              >
                Questions Upload Template
              </Link>)}
            </Grid>

          {/* Notifications icon */}
          <Grid item>
              <Tooltip title="Alerts • No alerts">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
          </Grid>

            <Grid item>
              <Account/>
            </Grid>
            
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar
        component="div"
        color="primary"
        position="static"
        elevation={0}
        sx={{ zIndex: 0 }}
      >
        <Toolbar>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid item xs>
              <Typography color="inherit" variant="h5" component="h1" fontWeight="bold">
                Practice Exam System
              </Typography>
            </Grid>
            <Grid item>

              {/*help icon*/}
              <Tooltip title="Help">
                <IconButton color="inherit">
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
};

export default Header;
