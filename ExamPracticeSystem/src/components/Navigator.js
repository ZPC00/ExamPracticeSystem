import * as React from 'react';
import { useContext } from 'react';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import TimerIcon from '@mui/icons-material/Timer';
import { AppContext } from './AppContext';
import DisplayAccountInfo from './displayAccountInfo';
import AccountMangement from './accountMangement'
import ManagePracticeBank from './PracticeBank/managePracticeBank'


const iconColor = 'rgba(255, 255, 255, 0.7)';

const categories = [
  {
    id: 'Student',
    children: [
      { id: 'Sequential Quiz', icon: <PeopleIcon sx={{ color: iconColor }} /> },
      { id: 'Disordered Quiz', icon: <DnsRoundedIcon sx={{ color: iconColor }} /> },
    ],
  },
  {
    id: 'Teacher',
    children: [
      { id: 'Pratice Bank Management', icon: <SettingsIcon sx={{ color: iconColor }} />, activeModule:<ManagePracticeBank/> },
      { id: 'View Grade', icon: <TimerIcon sx={{ color: iconColor }} /> },
    ],
  },
  {
    id: 'Management',
    children: [
      { id: 'Account Information', icon: <SettingsIcon sx={{ color: iconColor }} />, activeModule: <DisplayAccountInfo/> },
      { id: 'Account Management', icon: <TimerIcon sx={{ color: iconColor }} />,activeModule: <AccountMangement/>  },
    ],
  },
];

const item = {
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
};

const itemCategory = {
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
  py: 1.5,
  px: 3,
};

export default function Navigator(props) {
  const { ...other } = props;
  const { username, userAccount, setfuncts } = useContext(AppContext);
  const currentUserRole = userAccount.find(user => user.name === username)?.Loginrole;

  // filter categories by currentUserRole
  const isCategoryVisible = (category) => {
  if (category.id === 'Student' && (currentUserRole === 'Student' || currentUserRole === 'Administrator')) return true;
  if (category.id === 'Teacher' && (currentUserRole === 'Teacher' || currentUserRole === 'Administrator')) return true;
  if (category.id === 'Management'& (currentUserRole === 'Administrator' || currentUserRole === 'Student' || currentUserRole === 'Teacher')) return true;
  return false;
};

const filteredCategories = categories
  .filter(category => isCategoryVisible(category, currentUserRole))
  .map(category => ({
    ...category,
    children: category.children.filter(child => {
      if (child.id === 'Account Management' && currentUserRole !== 'Administrator') return false;
      if (child.id === 'Account Information' && (currentUserRole !== 'Administrator' && currentUserRole !== 'Student' && currentUserRole !== 'Teacher')) return false;
      return true;
    }),
  }));


  const handleModuleClick = (module) => {
    setfuncts(module);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: '#101F33',
          color: '#fff',
          height: '100vh',
          width: 240,
        },
      }}
      {...other}
    >
      <List disablePadding>
        {/* Drawer Title */}
        <ListItem sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}>
          Clark University
        </ListItem>
        {/* Project Overview */}
        <ListItem sx={{ ...item, ...itemCategory }}>
          <ListItemIcon>
            <HomeIcon sx={{ color: iconColor }} />
          </ListItemIcon>
          <ListItemText>Quiz Overview</ListItemText>
        </ListItem>

        {/* Categories */}
        {filteredCategories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: '#101F33' }}>
            {/* Category Header */}
            <ListItem sx={{ py: 1.5, px: 3 }}>
              <ListItemText sx={{ color: '#fff', textTransform: 'uppercase', fontWeight: 'bold' }}>
                {id}
              </ListItemText>
            </ListItem>
            
            {/* Category Items */}
            {children.map(({ id: childId, icon, activeModule }) => (
              <ListItem disablePadding key={childId}>
                <ListItemButton
                  selected={activeModule}
                  sx={{
                    ...item,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'rgba(223, 183, 24, 0.08)',
                    },
                  }}
                  onClick={() => handleModuleClick(activeModule)} // Handle module click
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>{childId}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ mt: 1, mb: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
