import React from "react";
import { withStyles } from '@material-ui/core/styles';
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

function TimePickers(props) {
    const {start,setStart,end,setEnd} = props
     // The first commit of Material-UI
       // const [selectedDate, setSelectedDate] = React.useState(new Date('2014-08-18T21:11:54'));
   
     return (
       <MuiPickersUtilsProvider utils={DateFnsUtils}>
         <Grid container justify="space-around">
           <KeyboardDatePicker
             disableToolbar
             variant="inline"
             format="dd/MM/yyyy"
             margin="normal"
             id="date-picker-inline"
             label="Start Date"
             value={start}
             onChange={(date) => setStart(date)}
             KeyboardButtonProps={{
               'aria-label': 'change date',
             }}
           />
          <KeyboardTimePicker
            margin="normal"
            id="time-picker"
            label="Start Time Picker"
            value={start}
            onChange={(date) => setStart(date)}
            KeyboardButtonProps={{
              'aria-label': 'change time',
            }}
          />

           <KeyboardDatePicker
             disableToolbar
             variant="inline"
             format="dd/MM/yyyy"
             margin="normal"
             id="date-picker-inline"
             label="End Date"
             value={end}
             onChange={(date) => setEnd(date)}
             KeyboardButtonProps={{
               'aria-label': 'change date',
             }}
           />
            <KeyboardTimePicker
            margin="normal"
            id="time-picker"
            label="End Time Picker"
            value={end}
            onChange={(date) => setEnd(date)}
            KeyboardButtonProps={{
              'aria-label': 'change time',
            }}
          />
         </Grid>
       </MuiPickersUtilsProvider>
     );
}

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


function ReportDialog(props) {
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
  const {setLocation,setKeyWords, setpageNum, setresultsNum} = props
  const classes = useStyles();
  return (
    <form className={classes.root} noValidate autoComplete="off" id = 'input-form'>
      <TextField id="location-input" variant="filled" label="Location" onChange={(elem) => setLocation(elem.target.value)}/>
      <TextField id="keyword-input" variant="filled" label="Keywords" onChange={(elem) => setKeyWords(elem.target.value)}/>
      <TextField id="page-number" defaultValue={"1"} label="Page Number" variant="filled" onChange={(elem) => setpageNum(elem.target.value)}/>
      <TextField id="results" defaultValue={"10"} label="Number of Results" variant="filled" onChange={(elem) => setresultsNum(elem.target.value)}/>
    </form>
     
  )
}




export function ReportPage() {
  const initDate = new Date()
  initDate.setDate(new Date().getDate()-7)
  const [startDate, setStartDate] = React.useState(initDate);
  const [endDate, setEndDate] = React.useState(new Date());
  const [reportData, setReportData] = React.useState([])
  

  const [location, setLocation] = React.useState("")
  const [keyWords, setKeyWords] = React.useState("")
  const [pageNum, setpageNum] = React.useState("1")
  const [resultsNum, setresultsNum] = React.useState("10")


  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [reportDetails, setReportDetails] = React.useState({})

  const searchHandler = () => {
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

    let fetchString = `https://us-central1-seng3011-hi-4.cloudfunctions.net/app/reports?start_date=${startYearStr}-${startMonthStr}-${startDateStr}T${startHourStr}:${startMinStr}:00&end_date=${endYearStr}-${endMonthStr}-${endDateStr}T${endHourStr}:${endMinStr}:00`
    if (keyWords!=="") {
      fetchString = fetchString + `&key_terms=${keyWords}`
    }
    if (location!=="") {
      fetchString = fetchString + `&location=${location}`
    }
    if (pageNum!=="") {
      fetchString = fetchString + `&page=${pageNum}`
    }
    if (resultsNum) {
      fetchString = fetchString + `&num=${resultsNum}`
    }
    fetch(fetchString)
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
    })
    .catch(data => {
      console.log(data)
    })

  }


  const openDialog = (obj) => {
    setReportDetails(obj)
    setDialogOpen(true)
  }


  const startSetter = (date) => {
    if (date > endDate) {
        // TODO Show error banner
        return
    }
    setStartDate(date)
  }

  const endSetter = (date) => {
    if (date < startDate) {
        // TODO Show error banner
        return
    }
    setEndDate(date)
  }

  return (
    <Container maxWidth="lg">
      <h2>Reports</h2>
      <TimePickers start={startDate} setStart={startSetter} end={endDate} setEnd={endSetter}></TimePickers>
      <Inputs setLocation={setLocation} setKeyWords={setKeyWords} pageum={pageNum} setpageNum={setpageNum} resultsNum={resultsNum} setresultsNum={setresultsNum}></Inputs>
      <Button variant="contained" color="primary" onClick={()=>searchHandler()}>Search</Button>
      <List>{
        reportData.map((x,i)=><ListItem key={i} button onClick={()=>{openDialog(x)}}>{x.headline}</ListItem >)}
      </List>
      
      <ReportDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} reportDetails={reportDetails}></ReportDialog>
    </Container>
  );
}