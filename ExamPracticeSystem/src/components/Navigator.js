import * as React from 'react';
import { useContext } from 'react';
import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Explicit as ExplicitIcon, Home as HomeIcon, People as PeopleIcon, Settings as SettingsIcon, Quiz as QuizIcon, ViewList as ViewListIcon,
         ViewQuilt as ViewQuiltIcon, Grading as GradingIcon, PlaylistAddCheckCircle as PlaylistAddCheckCircleIcon,
         PlaylistAdd as PlaylistAddIcon, PermContactCalendar as PermContactCalendarIcon, PlaylistAddCircle as PlaylistAddCircleIcon
} from '@mui/icons-material';
import { AppContext } from './AppContext';
import axios from 'axios';
import DisplayAccountInfo from './AccountManagement/displayAccountInfo';
import AccountMangement from './AccountManagement/accountMangement'
import ManagePracticeBank from './PracticeBank/managePracticeBank'
import PracticeGrades from './GradesView/PracticeGrades';
import PracticeSequential from './PracticeBank/PracticeSequential'
import PracticeUnorder from './PracticeBank/PracticeUnorder'
import PracticeMockExam from './PracticeBank/PracticeMockExam';
import ManageExamBank from './ExamBank/manageExamBank'
import ExamManagement from './ExamBank/examManagement';
import Exam from './ExamBank/Exam'
import ExamGrades from './GradesView/ExamGrades';


const iconColor = 'rgba(255, 255, 255, 0.7)';

// categories list
const categories = [
  {
    id: 'Student',
    children: [
      { id: 'Sequential Practice', icon: <ViewListIcon sx={{ color: iconColor }} /> , activeModule:<PracticeSequential/>},
      { id: 'Unordered Practice', icon: <ViewQuiltIcon sx={{ color: iconColor }} /> , activeModule:<PracticeUnorder/>},
      { id: 'Mock Exam', icon: <QuizIcon sx={{ color: iconColor }} /> , activeModule:<PracticeMockExam/>},
      { id: 'Exam', icon: <ExplicitIcon sx={{ color: iconColor }} /> , activeModule:<Exam/>}
    ],
  },
  {
    id: 'Teacher',
    children: [
      { id: 'Pratice Bank Management', icon: <PlaylistAddCircleIcon sx={{ color: iconColor }} />, activeModule:<ManagePracticeBank/> },
      { id: 'Exam Bank Management', icon: <PlaylistAddIcon sx={{ color: iconColor }} />, activeModule:<ManageExamBank/> },
      { id: 'View Practice Grades', icon: <PlaylistAddCheckCircleIcon sx={{ color: iconColor }} /> , activeModule:<PracticeGrades/>},
      { id: 'View Exam Grades', icon: <GradingIcon sx={{ color: iconColor }} /> , activeModule:<ExamGrades/>},
      { id: 'Exam Settings', icon: <SettingsIcon sx={{ color: iconColor }} />, activeModule:<ExamManagement/> },
    ],
  },
  {
    id: 'Management',
    children: [
      { id: 'Account Information', icon: <PermContactCalendarIcon sx={{ color: iconColor }} />, activeModule: <DisplayAccountInfo/> },
      { id: 'Account Management', icon: <PeopleIcon sx={{ color: iconColor }} />,activeModule: <AccountMangement/>  },
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
  
  // Context for user account and functs
  const { username, setfuncts, functs, examRuningState, setExamRuningState, currentUserInfor, setCurrentUserInfor } = useContext(AppContext);

  // current user role
  const currentUserRole = currentUserInfor.Loginrole;

  // log in control by filtering display categories by currentUserRole
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

  // function to change the display module
  const handleModuleClick = async (module) => {
    // check whether the exam is processing
    if (examRuningState) {
      const confirmExit = window.confirm("The exam is processing, changing the page will stop the exam and result in a score of 0. Are you sure?");
      if (!confirmExit) {
        return;
      }else{
        setExamRuningState(false)
        axios.post('https://exampracticesystem-backend.onrender.com/matchUserInfo',{username:username})
          .then(response => {
            setCurrentUserInfor(response.data.matchUser);
            })
          .catch(error => {
              console.error('Error fetching product data:', error);
            });
      }
    }
    if (functs===module){
     setfuncts("")  
     setTimeout(() => setfuncts(module), 0);
  } else
  {setfuncts(module);}
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
          <ListItemText>System Overview</ListItemText>
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
