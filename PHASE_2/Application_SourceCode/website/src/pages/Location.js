import React, {useState, useEffect} from "react";
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
// import Grid from '@material-ui/core/Grid';
// import DateFnsUtils from '@date-io/date-fns';
// import {
//   MuiPickersUtilsProvider,
//   KeyboardTimePicker,
//   KeyboardDatePicker,
// } from '@material-ui/pickers';
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
// import FormGroup from '@material-ui/core/FormGroup';
// import FormLabel from '@material-ui/core/FormLabel';
// import Switch from '@material-ui/core/Switch';
// import Checkbox from '@material-ui/core/Checkbox';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import CircularProgress from '@material-ui/core/CircularProgress';
// import DialogContentText from '@material-ui/core/DialogContentText';
//import DialogTitle from '@material-ui/core/DialogTitle';
// import Slide from '@material-ui/core/Slide';
import Popover from '@material-ui/core/Popover';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import  firebase  from '../Firebase.js';

import * as firebase2 from 'firebase';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';




// function TimePickers(props) {
//     const {start,setStart,end,setEnd,startTime} = props
//      // The first commit of Material-UI
//        // const [selectedDate, setSelectedDate] = React.useState(new Date('2014-08-18T21:11:54'));
   
//      return (
//        <MuiPickersUtilsProvider utils={DateFnsUtils}>
//          <Grid container justify="space-around">
//            <KeyboardDatePicker
//              disableToolbar
//              variant="inline"
//              format="MM/dd/yyyy"
//              margin="normal"
//              id="date-picker-inline"
//              label="Start Date"
//              value={start}
//              onChange={(date) => setStart(date)}
//              KeyboardButtonProps={{
//                'aria-label': 'change date',
//              }}
//            />
//           <KeyboardTimePicker
//             margin="normal"
//             id="time-picker"
//             label="Start Time picker"
//             value={start}
//             onChange={(date) => setStart(date)}
//             KeyboardButtonProps={{
//               'aria-label': 'change time',
//             }}
//           />

//            <KeyboardDatePicker
//              disableToolbar
//              variant="inline"
//              format="MM/dd/yyyy"
//              margin="normal"
//              id="date-picker-inline"
//              label="End Date"
//              value={end}
//              onChange={(date) => setEnd(date)}
//              KeyboardButtonProps={{
//                'aria-label': 'change date',
//              }}
//            />
//             <KeyboardTimePicker
//             margin="normal"
//             id="time-picker"
//             label="End Time picker"
//             value={end}
//             onChange={(date) => setEnd(date)}
//             KeyboardButtonProps={{
//               'aria-label': 'change time',
//             }}
//           />
//          </Grid>
//        </MuiPickersUtilsProvider>
//      );
// }

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
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

// function selectionSwitches(props) {
//   const { checked, toggleChecked } = props;
//   return (
//     <FormGroup>
//     <FormControlLabel
//       control={<Switch size="small" checked={checked} onChange={toggleChecked} />}
//       label="Small"
//     />
//     <FormControlLabel
//       control={<Switch checked={checked} onChange={toggleChecked} />}
//       label="Normal"
//     />
//   </FormGroup> 
//   )
// }
// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

function printVal(val) {
  console.log(val);
  // adjust user's email preferences for that location
}

function RadioButtons() {
  // const [email, setEmail] = React.useState(false);
  const [value, setSetting] = React.useState('none');

  // Get the the user (if they're logged in)
  const [loggedInData, setLoggedInData] = useState(null)
  useEffect(()=> {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        let userObj = {
          displayName:user.displayName,
          email:user.email,
          emailVerified:user.emailVerified,
          photoURL:user.photoURL,
          isAnonymous: user.isAnonymous,
          uid: user.uid,
          providerData: user.providerData
        }
  
        console.log("Logged In")
        console.log(userObj)
        setLoggedInData(userObj)
        // setUserData(userObj)
        // ...
      } else {
        console.log("Not signed in")
        setLoggedInData(null)
        // User is signed out.
        // ...
      }
    });
  }, [])


  const handleChange = (event) => {
    setSetting(event.target.value)
    printVal(event.target.value)
    if (loggedInData != null) {
     
      if (event.target.value == "none") {
        toast.info("Your email settings have been saved, we will no longer notify you");
      }
      if (event.target.value == "daily") {
        toast.info("Your email settings have been saved, we will notify you each day");
      }
      if (event.target.value == "weekly") {
        toast.info("Your email settings have been saved, we will notify you each week");
      }
      if (event.target.value == "monthly") {
        toast.info("Your email settings have been saved, we will no notify you each month");
      }

      
      // save preferences here
      firebase.firestore().collection('userData').doc(loggedInData.uid).update({emailPref: event.target.value});
    } else {
      toast.info("Log in to change your email settings")
    }
    console.log(loggedInData)

  };

  const confirmSettings = (event) => {
    console.log("Clicked here")
    
  }


  return (
    <FormControl component="fieldset">
    
    <RadioGroup aria-label="gender" name="gender1" value={value} onChange={handleChange}>
      <FormControlLabel value="daily" control={<Radio />} label="Daily"  />
      <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
      <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
      <FormControlLabel value="none" control={<Radio />} label="None" />

    </RadioGroup>
    
  </FormControl>
  );
}
var htmlExample = `
<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html style='width:100%;font-family:arial, helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;'>
 <head> 
  <meta charset='UTF-8'> 
  <meta content='width=device-width, initial-scale=1' name='viewport'> 
  <meta name='x-apple-disable-message-reformatting'> 
  <meta http-equiv='X-UA-Compatible' content='IE=edge'> 
  <meta content='telephone=no' name='format-detection'> 
  <title>New email</title> 
  <!--[if (mso 16)]>
    <style type='text/css'>
    a {text-decoration: none;}
    </style>
    <![endif]--> 
  <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> 
  <style type='text/css'>
@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class='gmail-fix'] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button { font-size:20px!important; display:block!important; border-width:10px 0px 10px 0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } .es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
#outlook a {
	padding:0;
}
.ExternalClass {
	width:100%;
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
	line-height:100%;
}
.es-button {
	mso-style-priority:100!important;
	text-decoration:none!important;
}
a[x-apple-data-detectors] {
	color:inherit!important;
	text-decoration:none!important;
	font-size:inherit!important;
	font-family:inherit!important;
	font-weight:inherit!important;
	line-height:inherit!important;
}
.es-desk-hidden {
	display:none;
	float:left;
	overflow:hidden;
	width:0;
	max-height:0;
	line-height:0;
	mso-hide:all;
}
</style> 
 </head> 
 <body style='width:100%;font-family:arial, helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;'> 
  <div class='es-wrapper-color' style='background-color:#F6F6F6;'> 
   <!--[if gte mso 9]>
			<v:background xmlns:v='urn:schemas-microsoft-com:vml' fill='t'>
				<v:fill type='tile' color='#f6f6f6'></v:fill>
			</v:background>
		<![endif]--> 
               <!--[if mso]></td></tr></table><![endif]--></td> 
             </tr> 
           </table></td> 
         </tr> 
       </table> 
       <table class='es-content' cellspacing='0' cellpadding='0' align='center' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;'> 
         <tr style='border-collapse:collapse;'> 
          <td align='center' style='padding:0;Margin:0;'> 
           <table class='es-content-body' width='600' cellspacing='0' cellpadding='0' bgcolor='#ffffff' align='center' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;'> 
             <tr style='border-collapse:collapse;'> 
              <td align='left' style='Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px;'> 
               <table width='100%' cellspacing='0' cellpadding='0' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;'> 
                 <tr style='border-collapse:collapse;'> 
                  <td width='560' valign='top' align='center' style='padding:0;Margin:0;'> 
                   <table width='100%' cellspacing='0' cellpadding='0' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;'> 
                     <tr style='border-collapse:collapse;'> 
                      <td align='left' style='padding:0;Margin:0;padding-bottom:15px;'><h2 style='Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:arial, helvetica, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#333333;'>
                      JAPAN - COVID-19 infections in Japan rise to 1,172, Tokyo confirms most cases nationwide
                      </h2></td> 
                     </tr> 
                     <tr style='border-collapse:collapse;'> 
                     </tr> 
                     <tr style='border-collapse:collapse;'> 
                      <td align='left' style='padding:0;Margin:0;padding-top:20px;'>
                        <p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, helvetica, sans-serif;line-height:21px;color:#333333;'>
                        <!-- ARTICLE_INFO -->
                        <b>Japan's health ministry and local governments said Tuesday the total number of COVID-19 cases in Japan stood at 1,172, with 32 new cases including 17 cases in Tokyo as of 6:45 p.m. local time here.</b>
                     </tr> 
                     <tr style='border-collapse:collapse;'> 
                      <td align='left' style='padding:0;Margin:0;padding-top:15px;'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, helvetica, sans-serif;line-height:21px;color:#333333;'>
                      <!-- SOURCE -->  
                      Source: <a href="http://www.xinhuanet.com/english/2020-03/24/c_138912445.htm" target="_blank">http://www.xinhuanet.com/english/2020-03/24/c_138912445.htm</a>
                      </p></td> 
                     </tr> 
                     <tr style='border-collapse:collapse;'> 
                      <td align='left' style='padding:0;Margin:0;padding-top:20px;'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, helvetica, sans-serif;line-height:21px;color:#333333;'>
                  
                      </p></td> 
                     </tr> 
                   </table></td> 
                 </tr> 
               </table></td> 
             </tr> 
           </table></td> 
         </tr> 
       </table> 
       <table class='es-footer' cellspacing='0' cellpadding='0' align='center' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;'> 
         <tr style='border-collapse:collapse;'> 
          <td align='center' style='padding:0;Margin:0;'> 
           <table class='es-footer-body' width='600' cellspacing='0' cellpadding='0' align='center' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;'> 
             <tr style='border-collapse:collapse;'> 
              <td align='left' style='Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px;'> 
               <table width='100%' cellspacing='0' cellpadding='0' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;'> 
                 <tr style='border-collapse:collapse;'> 
                  <td width='560' valign='top' align='center' style='padding:0;Margin:0;'> 
                   <table width='100%' cellspacing='0' cellpadding='0' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;'> 
                     <tr style='border-collapse:collapse;'> 
                      <td align='center' style='padding:20px;Margin:0;font-size:0;'> 
                       <table width='75%' height='100%' cellspacing='0' cellpadding='0' border='0' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;'> 
                         <tr style='border-collapse:collapse;'> 
                          <td style='padding:0;Margin:0px 0px 0px 0px;border-bottom:1px solid #CCCCCC;background:none;height:1px;width:100%;margin:0px;'></td> 
                         </tr> 
                       </table></td> 
                     </tr> 
                     <tr style='border-collapse:collapse;'> 
                      <td align='center' style='padding:0;Margin:0;padding-top:10px;padding-bottom:10px;'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:11px;font-family:arial, helvetica, sans-serif;line-height:17px;color:#333333;'>Sponsored by WHO</p></td> 
                     </tr> 
                     <tr style='border-collapse:collapse;'> 
                      <td align='center' style='padding:0;Margin:0;padding-top:10px;padding-bottom:10px;'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:11px;font-family:arial, helvetica, sans-serif;line-height:17px;color:#333333;'>© 2020 SENG HI-4</p></td> 
                     </tr> 
                   </table></td> 
                 </tr> 
               </table></td> 
             </tr> 
           </table></td> 
         </tr> 
       </table> 
       <table class='es-content' cellspacing='0' cellpadding='0' align='center' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;'> 
         <tr style='border-collapse:collapse;'> 
          <td align='center' style='padding:0;Margin:0;'> 
           <table class='es-content-body' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;' width='600' cellspacing='0' cellpadding='0' align='center'> 
             <tr style='border-collapse:collapse;'> 
              <td align='left' style='padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-bottom:30px;'> 
               <table width='100%' cellspacing='0' cellpadding='0' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;'> 
                 <tr style='border-collapse:collapse;'> 
                  <td width='560' valign='top' align='center' style='padding:0;Margin:0;'> 
                   <table width='100%' cellspacing='0' cellpadding='0' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;'> 
                     <tr style='border-collapse:collapse;'> 
                     </tr> 
                   </table></td> 
                 </tr> 
               </table></td> 
             </tr> 
           </table></td> 
         </tr> 
       </table></td> 
     </tr> 
   </table> 
  </div>  
 </body>
</html>`

function ConfirmButton() {
  
  const [popup, setPopup] = React.useState(null);

  const handleClick = (event) => {
    setPopup(event.currentTarget);

    /*const sgMail = require('@sendgrid/mail');
    const url = 'https://cors-anywhere.herokuapp.com/https://api.sendgrid.com/v3/mail/send'
    sgMail.setApiKey('');
    const msg = {
      "personalizations": [
        {
          "to": [
            {
              "email": "z5083848@ad.unsw.edu.au"
            }
          ],
          "subject": "Envoy Notifications"
        }
      ],
      "from": {
        "email": "hi4notifications@gmail.com"
      },
      "content": [
        {
          "type": "text/html",
          "value": htmlExample
        }
      ]
    };
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(msg),
      headers:{
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer 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',
        'Access-Control-Allow-Credentials': "*",
      },
    }).then(res => res.json())
    .then(response => console.log('Success:', JSON.stringify(response)))
    .catch(error => console.error('Error:', error));   */


    console.log('Adjusting email settings')
    //sgMail.send(msg);
    
  };

  // const handleClose = () => {
  //   setPopup(null);
  // }
  
  return (
    <div>
  <Button onClick = {handleClick} variant="contained" color="primary">
    Confirm email settings
  </Button>
  <Popover anchorEl={popup}>
    Testing123
  </Popover>
  </div>
  )
}

export function ReportDialog(props) {
  const {dialogOpen,setDialogOpen,reportDetails} = props

  return (
  <Dialog
    onClose={()=>setDialogOpen(false)}
    aria-labelledby="customized-dialog-title" 
    open={dialogOpen}
    fullWidth={true}
    maxWidth={"lg"}
  >
    <DialogTitle id="customized-dialog-title" onClose={()=>setDialogOpen(false)}>
      Report Details
    </DialogTitle>
    <DialogContent dividers>
      <h3>Headline</h3>
      <Typography gutterBottom>
        {reportDetails.headline}
      </Typography>

      <h3>Date Of Publication</h3>
      <Typography gutterBottom>
        {reportDetails.date_of_publication}
      </Typography>

      <h3>Main Text</h3>
      <Typography gutterBottom>
        {reportDetails.main_text}
      </Typography>

      <h3>Cases</h3>
      <Typography gutterBottom>
        {reportDetails.cases}
      </Typography>

      <h3>URL</h3>
      <Typography gutterBottom>
        <Link href={reportDetails.url} color="inherit">
          {reportDetails.url}
        </Link>
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button autoFocus onClick={()=>setDialogOpen(false)} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
}));

function Inputs(props) {
  const {setLocation,setKeyWords} = props
  const classes = useStyles();
  var url = window.location.href
  var curLoc = url.search(/[^\/]*$/g)
  var loc = "Australia"
  if (curLoc != 0) {
    var loc = url.substring(curLoc, url.length)
  } 
  


  const checkEnter = (e) => {
  
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log("Enter pressed");
      //console.log(setLocation, props.location, props.id, e.target.value);
      setLocation(e.target.value)
    }
  }

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <TextField id="location-input" variant="filled" label='Location' onKeyDown={checkEnter}/>
      {/*<TextField id="keyword-input" variant="filled" label="Keywords" />*/}
    </form>
  )
}


export default function SwitchesGroup(country) {
  const [state, setState] = React.useState({
    selected: false,
  });
  const {countryVal} = country;
  const [loggedInData, setLoggedInData] = useState(null)
  useEffect(()=> {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        let userObj = {
          displayName:user.displayName,
          email:user.email,
          emailVerified:user.emailVerified,
          photoURL:user.photoURL,
          isAnonymous: user.isAnonymous,
          uid: user.uid,
          providerData: user.providerData
        }
  
        console.log("Logged In")
        console.log(userObj)
        setLoggedInData(userObj)
        // setUserData(userObj)
        // ...
      } else {
        console.log("Not signed in")
        setLoggedInData(null)
        // User is signed out.
        // ...
      }
    });
  }, [])
  const handleChange = (event) => {
    console.log()
    if (loggedInData) {
      setState({ ...state, [event.target.name]: event.target.checked });
      if (event.target.checked == true) {
        firebase2.firestore().collection('userData').doc(loggedInData.uid).update({
          location: firebase2.firestore.FieldValue.arrayUnion(country.country)     
        });
        toast.info("Notifications succesfully added for " + country.country)
      } else {
        firebase2.firestore().collection('userData').doc(loggedInData.uid).update({
          location: firebase2.firestore.FieldValue.arrayRemove(country.country)       
        });
        toast.info("Notifications for " + country.country + " have been removed")
      }
      
    } else {
      toast.info("Log in to change your email settings")
    }
  };

  return (
    <FormControl component="fieldset"  >
      <FormLabel component="legend">Get email notifications</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={state.selected} onChange={handleChange} name="selected" />}
        />
      </FormGroup>
      {/*<FormHelperText>Set frequency in profile page</FormHelperText>*/}
    </FormControl>
  );
}




export function LocationPage() {
  const initDate = new Date()
  initDate.setDate(new Date().getDate()-50)
  const [startDate, setStartDate] = React.useState(initDate);
  const [endDate, setEndDate] = React.useState(new Date());
  const [reportData, setReportData] = React.useState([])
  const [showReports, setShowReports] = React.useState(true)
  var url = window.location.href
  var curLoc = url.search(/[^?]*$/g)
  curLoc = url.substring(curLoc, url.length)

  const [location, setLocation] = React.useState(curLoc)
  const [keyWords, setKeyWords] = React.useState("Coronavirus")
  const [loader, setLoader] = React.useState(true);



  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [reportDetails, setReportDetails] = React.useState({})

  useEffect(() => {
    const startYearStr = startDate.getFullYear()
    let startMonth = String(startDate.getMonth()+1)
    const startMonthStr = (startMonth.padStart(2,'0'))
    let startDay = String(startDate.getDate())
    const startDateStr = startDay.padStart(2,'0')

    const startHour = String(startDate.getHours())
    const startHourStr = startHour.padStart(2,'0')
    const startMin = String(startDate.getMinutes())
    const startMinStr = startMin.padStart(2,'0')

    const endYearStr = endDate.getFullYear()
    let endMonth = String(endDate.getMonth()+1)
    const endMonthStr = (endMonth.padStart(2,'0'))
    let endDay = String(endDate.getDate())
    const endDateStr = endDay.padStart(2,'0')   
    const endHour = String(endDate.getHours())
    const endHourStr = endHour.padStart(2,'0')
    const endMin = String(endDate.getMinutes())
    const endMinStr = endMin.padStart(2,'0')    

    setLoader(true);
    setShowReports(false);
    fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/reports?STart_DAte=${startYearStr}-${startMonthStr}-${startDateStr}T${startHourStr}:${startMinStr}:00&end_date=${endYearStr}-${endMonthStr}-${endDateStr}T${endHourStr}:${endMinStr}:00&key_terms=${keyWords}&location=${location}`)
    .then(response => {
      if (response.status===200) {
        return response.json()
      } else {
        response.text().then(x=>{console.log(x)})
        throw new Error("Error")
      }
    })
    .then(data => {
      setReportData(data)
      setLoader(false);
      setShowReports(true);

    })
    .catch(data => {
      console.log(data)
    })

  },[startDate,endDate,location,keyWords])


  const openDialog = (obj) => {
    setReportDetails(obj)
    setDialogOpen(true)
  }


  // const startSetter = (date) => {
  //   if (date > endDate) {
  //       // TODO Show error banner
  //       return
  //   }
  //   setStartDate(date)
  // }

  // const endSetter = (date) => {
  //   if (date < startDate) {
  //       // TODO Show error banner
  //       return
  //   }
  //   setEndDate(date)
  // }

  const locationSetter = (location) => {
    //location.preventDefault();
    setLocation(location)
  }

  const loaderSetter = (loader) => {
    console.log("NEED TO REMOVE LOADER NOW")
  }
  

  return (
    <Container maxWidth="lg">
      <h2>Get mail notifications &#40;by location&#41;</h2>
      <p> Get the latest news for a chosen location: </p>
      {/*<TimePickers start={startDate} setStart={startSetter} end={endDate} setEnd={endSetter}></TimePickers>*/}
      <Inputs setLocation={locationSetter} setKeyWords={setKeyWords}></Inputs>
      
      {showReports && <List>{
        
        reportData.map((x,i)=><ListItem key={i} button onClick={()=>{openDialog(x)}}>{x.headline}</ListItem >)}
      </List>}
      {!loader && <SwitchesGroup country={location}></SwitchesGroup>}
      {loader && <CircularProgress style={{position:'absolute', top:'35%'}}/> }
      <ReportDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} reportDetails={reportDetails}></ReportDialog>
      {/*<RadioButtons> takeAway={loaderSetter}</RadioButtons>*/}
      
    </Container>
  );
}