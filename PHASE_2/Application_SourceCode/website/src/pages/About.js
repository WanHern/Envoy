import React, {useEffect} from "react";
// import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Switch from '@material-ui/core/Switch';
import Checkbox from '@material-ui/core/Checkbox';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogContentText from '@material-ui/core/DialogContentText';
//import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Popover from '@material-ui/core/Popover';
import infoImage from '../assets/info.png'
import globeImage from '../assets/globe.png'
import dataImage from '../assets/data.png'
import cityImage from '../assets/city.jpg'
import '../../src/App.css'

const aboutImages = [ {'image':infoImage},
                      {'image':globeImage},
                      {'image':dataImage},
                      {'image':cityImage} ]



const paragraphStyle = {
    fontSize : 18
}


export function featureSections() {
  return (
    <div style={{width: 180, height: 180, backgroundColor: 'powderblue', position: 'absolute', top:'55%', left:'25%'}}> 
      <div style={{position:'absolute', top:'100%', textAlign:"center", fontFamily:'Poiret One'}}>
        text
      </div>
    </div>
  )
}

function ConfirmButton(text) {
  
  const handleClick = (event) => {
    console.log("clicked ", event)

  }
  return (
    <div>

    <Button onClick = {handleClick} variant="contained" color="primary">
      {text}
    </Button>
  
  </div>
  )
}
export function AboutPage() {

  return (
    <Container maxWidth="md">
      <div style={{position: 'absolute', width: '100%', height: '45%',zIndex:-1,left:0,top:0, backgroundColor:'#c1c1c1',backgroundImage:`url(${aboutImages[3].image})`,backgroundSize:'100%', backgroundPosition:'center top'}}>
      <h2 style={{width:'50%', height:'50%', left:'25%', position:'absolute', top:'50%', color:'#000', backgroundColor:'#000', opacity:0.6}}></h2>
      <h2 style={{fontFamily:'Poiret One', fontSize:100, letterSpacing:20, left:'38%', position:'absolute', top:'48%', color:'#fff',}}>ENVOY</h2>
      {/*<h2 style={{fontFamily:'Poiret One', fontSize:20, letterSpacing:5, left:'40%', position:'absolute', top:'105%'}}>We provide you with ...</h2>*/}
      </div>
      <div className="aboutIcon" style={{width: 180, height: 180,  position: 'absolute', top:'55%', left:'25%', backgroundSize:'100%',backgroundImage:`url(${aboutImages[0].image})`}}> 
          <div style={{position:'absolute', top:'103%', textAlign:"center"}}>
            Convienient access to accurate information
          </div>
          <Button variant="contained" color="primary" style={{position:'absolute', top:'130%', left:'2%'}} href='locationInfo'>
            signup for emails
          </Button>
      </div>
      <div className="aboutIcon" style={{width: 180, height: 180,  position: 'absolute', top:'55%', left:'45%', backgroundSize:'100%',backgroundImage:`url(${aboutImages[1].image})`}}> 
            <div style={{position:'absolute', top:'103%', textAlign:"center"}}>
            Visual representations of current disease states
          </div>
          <Button variant="contained" color="primary" style={{position:'absolute', top:'130%', left:'2%'}} href='/'>
            explore heat-map
          </Button>
      </div>
      <div className="aboutIcon" style={{width: 180, height: 180, position: 'absolute', top:'55%', left:'65%', backgroundSize:'100%',backgroundImage:`url(${aboutImages[2].image})`}}> 
          <div style={{position:'absolute', top:'103%', textAlign:"center"}}>
            Access to past articles and news sources
          </div>  
          <Button variant="contained" color="primary" style={{position:'absolute', top:'130%', left:'10%'}} href='reports'> 
            view reports
          </Button>    
      </div>

      {/*
      <p2 style={paragraphStyle}> Welcome to Envoy. We combine real-time data from various sources to deliver accurate and reliable updates on disease-related news. 
      Through our service you can monitor infection rates for various diseases, browse through our collection of news articles, 
      and also signup for email notifications to send the latest findings straight to your inbox.  
      </p2>*/}
    </Container>
  );
}