import React, {useState} from "react";
import { Redirect } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { dbip } from '../components/dbip'


const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
}));

function Inputs(props) {
  const {email, password, setEmail, setPassword} = props
  const classes = useStyles();
  return (
    <form className={classes.root} noValidate autoComplete="off" id = 'input-form'>
      <TextField id="email-input" variant="filled" label="Email" onChange={(email) => setEmail(email.target.value)}/>
      <br></br>
      <TextField id="password-input" type="password" variant="filled" label="Password" onChange={(password) => setPassword(password.target.value)}/>
    </form>
  )
}



async function get_ip(){
  var location = {}
  var ip
  try {
    // get ip address
    var ipreq = await fetch("https://api.ipify.org/?format=json");
    ip = await ipreq.json();
    // get geo location using ip.ip
    var req = await fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/ipToLocation?ip=${ip.ip}`);
    location = await req.json();
  }
  catch (err) {
      console.log(err); // Catches and logs any error
  }
  // location = { address: 'X.X.X.X',
  //              country: 'AU',
  //              stateprov: 'New South Wales',
  //              city: 'Sydney' }

  console.log(ip);
  console.log(location)
};

export function SignupPage() {

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [redirect, setRedirect] = useState(false);

  const notify = () => {
    toast.info('basic');
  };

  // Checks if string is empty
  const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
  }

  // Checks if email is valid
  const isEmail = (email) => {
      const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (email.match(regex)) return true;
      else return false; 
  }

  // Handle a sign up request
  const signup = (() => {
    console.log("email:", email+", password:", password);
    if (!isEmail(email)) {
      setRedirect(false);
      toast.error("Invalid email, please try again", {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      })
    }
    else {
      setRedirect(true);
    }
    console.log("redirect:", redirect);
  });

  // Sign up succeeds
  if (redirect) {
    return (<Redirect to={{
      pathname: '/',
      state: { message: "Signed up successfully!" }
    }} />);
  }

  return (
    <Container maxWidth="lg">
        <h2>Sign up</h2>
        <Inputs setEmail={setEmail} setPassword={setPassword}></Inputs>
        <Button variant="contained" color="primary" onClick={() => {
          get_ip()
        }}>Sign up</Button>{' '}
    </Container>
  );
}