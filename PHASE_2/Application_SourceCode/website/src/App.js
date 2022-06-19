import React, {useEffect} from "react";
// import clsx from 'clsx';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import MaterialUIPickers from './coverage.js'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NavBar } from './components/Nav.js'
import { ReportPage } from './pages/Reports.js'
import { LocationPage } from './pages/Location.js'
import { SignupPage } from './pages/Signup.js'
import { ProfilePage } from './pages/Profile.js'
import { HomePage } from './pages/Home.js'
import { AboutPage } from './pages/About.js'
import { Authentication } from './components/Authentication.js'
import { Dashboard } from './pages/Dashboard.js'
import  firebase  from './Firebase';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  // Link
} from "react-router-dom";

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  }
});

const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#2A1B3D',
      contrastText: '#fff',
    },
    secondary: {
      main: '#8E8D8A',
      contrastText: '#fff',
    },
    error: {
      main: '#BD0043',
      contrastText: '#fff',
    },
    divider: '#D7D6D5',
    background: {
      paper: "#FFFAF5",
      default: "#FFFAF5"
    },
  },
});

export default function BasicExample() {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
      <div>
      <ToastContainer autoClose={2000} position={toast.POSITION.TOP_CENTER} />
        <AppBar position="static">
          <Toolbar>
            <NavBar></NavBar>
            <Typography variant="h6" className={classes.title}>
              Envoy
            </Typography>
              <Authentication></Authentication>
          </Toolbar>
        </AppBar>
        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
        <Switch>
          <Route exact path="/" component={HomePage}/>
          <Route path="/dashboard">
          <Dashboard name="Park" date="12th April 2020" />
          </Route>
          <Route path="/about">
            <AboutPage />
          </Route>
          <Route path="/locationInfo">
            <LocationPage />
          </Route>
          <Route path="/signup">
            <SignupPage />
          </Route>
          <Route path="/reports">
            <ReportPage />
          </Route>
          <Route path="/profile">
            <ProfilePage />
          </Route>
        </Switch>
      </div>
    </Router>
    </ThemeProvider>
  );
}

// class LocTest extends React.Component {
//   render() {
//     console.log(this.props.location)
//     return <>{JSON.stringify(this.props.location.state)}</>
//   }
// }


function About() {
  return (
    <div>
      <h2>About</h2>
      <About></About>
    </div>
  );
}