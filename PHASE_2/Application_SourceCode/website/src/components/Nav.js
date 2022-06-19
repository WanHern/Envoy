import React, {useEffect} from "react";

import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import  firebase  from '../Firebase';

// import {
//     BrowserRouter as Router,
//     Switch,
//     Route,
//     Link
//   } from "react-router-dom";

import {
    // BrowserRouter as Router,
    // Switch,
    // Route,
    Link
  } from "react-router-dom";

const useStyles = makeStyles({
    list: {
      width: 250,
    },
    fullList: {
      width: 'auto',
    }
  });


export function NavBar() {
    const classes = useStyles();
    const [state, setState] = React.useState({
      top: false,
      left: false,
      bottom: false,
      right: false,
    });

    const [loggedIn, setLoggedIn] = React.useState(false)
    useEffect(()=> {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          setLoggedIn(true)
        } else {
          setLoggedIn(false)
        }
      });
    }, [])
  
  
    const toggleDrawer = (anchor, open) => event => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
  
      setState({ ...state, [anchor]: open });
    };
  
    const list = anchor => (
      <div
        className={clsx(classes.list, {
          [classes.fullList]: anchor === 'top' || anchor === 'bottom',
        })}
        role="presentation"
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
      >
        <List>
          <ListItem button key={"home"} to="/" component={Link}><img src={require('../images/home-resize.png')} />. Home</ListItem>
          {loggedIn? <ListItem button key={"dashboard"} to="/dashboard" component={Link}><img src={require('../images/dashboard-resize.png')} />. My Dashboard</ListItem> : null }
          <ListItem button key={"locationInfo"} to="/locationInfo" component={Link}><img src={require('../images/location-resize.png')} />. Mail notifications</ListItem>
          <ListItem button key={"reports"} to="/reports" component={Link}><img src={require('../images/reports-resize.png')} />. Reports</ListItem>
          {loggedIn ? <ListItem button key={"profile"} to="/profile" component={Link}><img src={require('../images/profile-resize.png')} />. Profile</ListItem> : null }
          <ListItem button key={"about"} to="/about" component={Link}><img src={require('../images/question-resize.png')} />. About</ListItem>
        </List>
      </div>
    );
  
    return (
      <div>
          <React.Fragment key={"left"}>
            <IconButton edge="start" className={classes.menuButton} onClick={toggleDrawer("left", true)} color="inherit" aria-label="menu">
                <MenuIcon />
            </IconButton>
            <Drawer anchor={"left"} open={state["left"]} onClose={toggleDrawer("left", false)}>
              {list("left")}
            </Drawer>
          </React.Fragment>
      </div>
    );
  }