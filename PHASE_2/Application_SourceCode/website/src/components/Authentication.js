import React, {useEffect} from "react";
// import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
// import MaterialUIPickers from './coverage.js'

import "react-toastify/dist/ReactToastify.css";
import  firebase  from '../Firebase';
import countryCodes from '../static/CountryCodes';

const styles = (theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },    

  });
  
  const DialogContent = withStyles((theme) => ({
    root: {
      padding: theme.spacing(2),
    },
  }))(MuiDialogContent);
  
  const DialogActions = withStyles((theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(1),
    },
  }))(MuiDialogActions);
  
  const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });




  const useStyles = makeStyles({
    list: {
      width: 250,
    },
    fullList: {
      width: 'auto',
    },
    tr: {
      color: '#fff',
      '&:hover': {
        color: '#ff9999',
      }
    }
  });
  
  
  function Inputs(props) {
    const { setEmail, setPassword, error} = props
    const classes = useStyles();
    return (
      <form className={classes.root} noValidate autoComplete="off" id = 'input-form'>
        <TextField id="email-input" variant="filled" label="Email" error={error!==false} onChange={(email) => setEmail(email.target.value)}/>
        <br></br>
        <TextField id="password-input" type="password" variant="filled" error={error!==false} label="Password" helperText={error} onChange={(password) => setPassword(password.target.value)}/>
      </form>
    )
  }
  
  
  function LoginDialog(props) {
    const {dialogOpen,setDialogOpen, setEmail, setPassword, login, loginError} = props
  
    return (
    <Dialog
      onClose={()=>setDialogOpen(false)}
      aria-labelledby="customized-dialog-title" 
      open={dialogOpen}
      fullWidth={true}
      maxWidth={"sm"}
    >
      <DialogTitle id="customized-dialog-title" onClose={()=>setDialogOpen(false)}>
        Login
      </DialogTitle>
      <DialogContent dividers>
        <Inputs setEmail={setEmail} setPassword={setPassword} error={loginError}></Inputs>
        <Button onClick={login}>Login</Button>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={()=>setDialogOpen(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
    )
  }
  
  
  function SignupDialog(props) {
    const {dialogOpen,setDialogOpen, setEmail, setPassword, signup, error, signUpSuccess, autoLocation} = props
  
    return (
    <Dialog
      onClose={()=>setDialogOpen(false)}
      aria-labelledby="customized-dialog-title" 
      open={dialogOpen}
      fullWidth={true}
      maxWidth={"sm"}
    >
      <DialogTitle id="customized-dialog-title" onClose={()=>setDialogOpen(false)}>
        Sign Up
      </DialogTitle>
      <DialogContent dividers>
        {signUpSuccess ?
        <>
          <p>Congratulations on joining Envoy!</p>
          <p>You can get back to what you were doing, but when you want to set up your email preferences, just head over to the profile page.</p>
          {autoLocation !==false ? <p>We have detected {autoLocation} as your current location - you may also change that in the profile page if you'd like.</p> : null}
        </>
        :
        <>
          <Inputs setEmail={setEmail} setPassword={setPassword} error={error}></Inputs>
          <Button onClick={signup}>Signup</Button>
        </>
        }
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={()=>setDialogOpen(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
    )
  }
  
  async function initialUserData(email,setAutoLocation) {
    var location = {}
    var ip
    try {
      // get ip address
      var ipreq = await fetch("https://api.ipify.org/?format=json");
      ip = await ipreq.json();
      // get geo location using ip.ip
      var req = await fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/ipToLocation?ip=${ip.ip}`);
      location = await req.json();
      // Map the obtained country code to its full name
      var detectedLoc = "";
      for (const [index, value] of countryCodes.entries()) {
        if (value.Code === location.country) {
          detectedLoc = value.Name;
          break;
        }
      }
      console.log("FUll country name: "+detectedLoc)
      // Initialise the user's data
      let initialLoc = []
      if (detectedLoc!=="") {
        initialLoc=[detectedLoc]
        setAutoLocation(detectedLoc)
      }
      firebase.firestore().collection('userData').doc(firebase.auth().currentUser.uid).set({
        emailPref: "None",
        name: email,
        location: initialLoc, 
        email: email, 
        sendQuantity: 3,
        lastLogin: new Date().toISOString(), 
        aRead: [],
        autoLocation: location
      })
      
    }
    catch (err) {
        console.log(err); // Catches and logs any error
    }
    // location = { address: 'X.X.X.X',
    //              country: 'AU',
    //              stateprov: 'New South Wales',
    //              city: 'Sydney' }

  };


export function Authentication() {
    const classes = useStyles();

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loggedIn, setLoggedIn] = React.useState(false)
    const [loginDiagOpen, openDiag] = React.useState(false)
    const [signupDiagOpen, openSignupDiag] = React.useState(false)
    const [loginError, setLoginError] = React.useState(false)
    const [signUpError, setSignUpError] = React.useState(false)
    const [signUpComplete, setSignUpComplete] = React.useState(false)
    const [autoLocation, setAutoLocation] = React.useState(false)
    const boundDiagOpener = openDiag.bind()
    const boundSignupDiagOpener = openSignupDiag.bind()
    const setEmailBound = setEmail.bind()
    const setPasswordBound = setPassword.bind()   

    useEffect(()=> {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            setLoggedIn(true)
          } else {
            setLoggedIn(false)
          }
        });
      }, [])
    
      const openSignUpHandler = () => {
        setSignUpComplete(false)
        setSignUpError(false)
        openSignupDiag(true)
      }
    
      const openLoginHandler = () => {
        setLoginError(false)
        openDiag(true)
      }
    
      const signup = () => {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user=> {
          console.log("User", user)
          toast.info("Signed up successfully!")
          setSignUpError(false)
    
          initialUserData(email,setAutoLocation)
          setSignUpComplete(true)
          // openSignupDiag(false)
          .catch(err=>console.log(err))
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          setSignUpError(errorMessage)
          // ...
        });
      }
    
    
      const login = () => {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(x=> {
          // Successful login case
          toast.info("Logged in successfully!")
          openDiag(false)
          setLoginError(false)
        })
        .catch(function(error) {
           // Failed login case
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          setLoginError(errorMessage)
          openDiag(true)
          // ...
        });
    
      };
    
      const logout = () => {
        firebase.auth().signOut().then(function() {
          console.log('Signed Out');
          toast.info("Logged out successfully!")
        }, function(error) {
          console.error('Sign Out Error', error);
        });
      }

      return (
          <>
            {loggedIn ?
              <Button onClick={logout} className={classes.tr} color="#fff" style={{paddingLeft:'20px', position:'absolute', right:'140px' }}>Logout</Button> 
             :
             <>
              <Button onClick={() => openLoginHandler()} className={classes.tr} color="#fff" style={{paddingLeft:'20px', position:'absolute', right:'140px' }}>Login</Button>
              <Button onClick={() => openSignUpHandler()} className={classes.tr} color="#fff" style={{paddingLeft:'20px', position:'absolute', right:'50px' }}>Sign Up</Button>
             </>
            }
            <LoginDialog dialogOpen={loginDiagOpen} setDialogOpen={boundDiagOpener} setEmail={setEmailBound} setPassword={setPasswordBound} login={login} loginError={loginError}></LoginDialog>
            <SignupDialog dialogOpen={signupDiagOpen} autoLocation={autoLocation} setDialogOpen={boundSignupDiagOpener} setEmail={setEmailBound} setPassword={setPasswordBound} signup={signup} error={signUpError} signUpSuccess={signUpComplete}></SignupDialog>

          </>
      )

}