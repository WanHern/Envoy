import React, {useState, useEffect} from "react";
import { Redirect } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import  firebase  from '../Firebase.js';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { JHCountryList } from '../static/JHCountryList'
import Slider from '@material-ui/core/Slider';

import { CountryCards } from '../components/CountryCards'

console.log(JHCountryList)
const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
}));

function Inputs(props) {
  const {name, email, freq, setName, setEmail, setFreq, location, setLocation, sendQuantity, setSendQuantity} = props
  const classes = useStyles();
  return (
    <form className={classes.root} noValidate autoComplete="off" id = 'input-form'>
      <TextField id="name-input" variant="filled" label="Name" onChange={(event) => setName(event.target.value)} defaultValue={name}/>
      <br></br>
      <TextField id="email-input" variant="filled" label="Email address" onChange={(event) => setEmail(event.target.value)} defaultValue={email}/>
      <br></br>
      <p>Article Quantity:</p>
      <Slider
        defaultValue={30}
        aria-labelledby="discrete-slider"
        valueLabelDisplay="auto"
        value={sendQuantity}
        onChange={(event,value)=>setSendQuantity(value)}
        step={1}
        marks={true}
        min={1}
        max={8}
      />
      <br></br>
      {/* <TextField id="freq-input" variant="filled" label="Email frequency" onChange={(freq) => setFreq(freq.target.value)}/> */}
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Email Frequency</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={freq}
          onChange={(event) => setFreq(event.target.value)}
        >
          <MenuItem value={"None"}>None</MenuItem>
          <MenuItem value={"Daily"}>Daily</MenuItem>
          <MenuItem value={"Weekly"}>Weekly</MenuItem>
          {/* <MenuItem value={30}>Thirty</MenuItem> */}
        </Select>
      </FormControl>
      <br></br>
      <Autocomplete
          multiple
          value={location.map(x=>{
            return JHCountryList.find(y=>y.countryName===x)
          })}
          onChange={(event, value, reason) => {
            setLocation(value.map(x=>x.countryName))
          }}
          id="combo-box-demo"
          options={JHCountryList}
          getOptionLabel={(option) => option.countryName}
          style={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Countries" variant="outlined" />}
      />
    </form>
  )
}

export function ProfilePage() {

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [freq, setFreq] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [location, setLocation] = React.useState([]);
  const [sendQuantity, setSendQuantity] = React.useState([]);
  const [userData, setUserData] = useState(null);
  const [loggedInData, setLoggedInData] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [dataRefresh, setdataRefresh] = useState(0)

  var timeout

  const notify = () => {
    toast.info('basic');
  };


  // The empty array at the end signifies this to only run intially, similar to ComponentDidMount for classes
  // We want this behaviour because this is binding a handler, and we only want it to bind once
  useEffect(()=> {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        // User is signed in.
        let userObj = {
          displayName:user.displayName,
          name:user.name,
          emailPref:freq,
          email:user.email,
          emailVerified:user.emailVerified,
          photoURL:user.photoURL,
          isAnonymous: user.isAnonymous,
          uid: user.uid,
          providerData: user.providerData,
        }
  
        console.log("Logged In")
        console.log(userObj)

        setLoggedInData(userObj)
        // setUserData(userObj)
        // ...
      } else {
        console.log("Not signed in")
        setLoggedInData(false)
        // User is signed out.
        // ...
      }
    });
  }, [])


  // The array at the end here triggers this function to run whenever logginData changes, which triggers us to fetch data from the DB everytime the logged in state of the user changes.

  useEffect(()=> {
    if (loggedInData!==null && loggedInData!==false) {
      firebase.firestore().collection('userData').doc(loggedInData.uid).get()
      .then(doc =>{
        setUserData(doc.data())
        setName(doc.data().name)
        // setEmail(loggedInData.email)
        setLocation(doc.data().location)
        setSendQuantity(doc.data().sendQuantity)
        setFreq(doc.data().emailPref)
        setCountry(doc.data().autoLocation.country)
      })
      .catch(err => {
        setUserData(null)
      })
    } else {
      setUserData(null)
    }
    
  },[loggedInData,dataRefresh])

  // Handle a update request
  const updateDetails = ((uid) => {
    const updateObj = {
      emailPref: freq,
      sendQuantity: sendQuantity,
      location: location,
      name: name
    }
    
    firebase.firestore().collection('userData').doc(uid).update(updateObj);
    toast.info("Details successfully updated!")
    setdataRefresh(dataRefresh+1) // Used to force refresh and pull fresh data after updating details.
  });

  if (loggedInData===false) {
    if (redirect) {
      clearTimeout(timeout)
      return (<Redirect to="/" />)
    } else {
      timeout = setTimeout(() => setRedirect(true), 2000)
      return (<Container maxWidth="sm"><p>Not currently logged in. Redirecting to Home</p></Container>)
    }
  }
  return (
    <Container maxWidth="lg">
        <h2>Profile page</h2>

        {loggedInData === null ? <p>Not Logged in</p> :
        <>
          {/* <p>UID: {loggedInData.uid}</p> */}
          {userData != null ? 
          <div>
            <b>Details</b>
            <Inputs name={userData.name} email={loggedInData.email} freq={freq} country={userData.autoLocation.country} 
              setName={setName} setEmail={setEmail} setFreq={setFreq} setCountry={setCountry}
              location={location} setLocation={setLocation} sendQuantity={sendQuantity} setSendQuantity={setSendQuantity}
              ></Inputs>
            <Button variant="contained" color="primary" onClick={() => {
              updateDetails(loggedInData.uid)
            }}>Update details</Button>{' '}
          </div>
           : null}
        </>
        }
    </Container>
  );
}