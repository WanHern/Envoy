import React, {useState, useEffect} from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ReportDialog } from './Location.js'

import { CountryCards } from '../components/CountryCards'
import "react-toastify/dist/ReactToastify.css";
import  firebase  from '../Firebase.js';


import "react-toastify/dist/ReactToastify.css";




export function Dashboard(props) {
  const [name, setName] = React.useState("");
  const [loginDate, setLoginDate] = React.useState("")
  const { date } = props
  const initDate = new Date()
  initDate.setDate(new Date().getDate()-50)
  const [startDate, setStartDate] = React.useState(initDate);
  const [endDate, setEndDate] = React.useState(new Date());
  const [faveReportData, setFaveReportData] = React.useState([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [showReports, setShowReports] = React.useState(true)
  const [loader, setLoader] = React.useState(true);
  const [location, setLocation] = React.useState([]);
  const [userData, setUserData] = useState(null);
  const [loggedInData, setLoggedInData] = useState(null);
  const [dataRefresh, setdataRefresh] = useState(0)
  const [diagData, setDiagData] = useState({})

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

  const results = new Array(location.length)
  const fetches = location.map((loc,i)=>fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/reports?STart_DAte=${startYearStr}-${startMonthStr}-${startDateStr}T${startHourStr}:${startMinStr}:00&end_date=${endYearStr}-${endMonthStr}-${endDateStr}T${endHourStr}:${endMinStr}:00&location=${loc}`)
  .then(response => {
    if (response.status===200) {
      return response.json()
    } else {
      response.text().then(x=>{console.log(x)})
      throw "Error"
    }
  })
  .then(x=>results[i]=x))
  Promise.all(fetches)
  .then(x=>{
    console.log(results)
    setFaveReportData(results.reduce((prev,curr)=>{
      console.log(curr.slice(0,4))
      return prev.concat(curr.slice(0,4))
    },[]).filter((x,i,arr)=>arr.findIndex(y=>y.url===x.url)===i))
    setLoader(false);
    setShowReports(true);
  })

  // fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/reports?STart_DAte=${startYearStr}-${startMonthStr}-${startDateStr}T${startHourStr}:${startMinStr}:00&end_date=${endYearStr}-${endMonthStr}-${endDateStr}T${endHourStr}:${endMinStr}:00&location=South Korea`)
  // .then(response => {
  //   if (response.status===200) {
  //     return response.json()
  //   } else {
  //     response.text().then(x=>{console.log(x)})
  //     throw "Error"
  //   }
  // })
  // .then(data => {
  //   setFaveReportData(data)
  //   setLoader(false);
  //   setShowReports(true);
  //   console.log(data)
  // })
  // .catch(data => {
  //   console.log(data)
  // })
},[location])



useEffect(()=> {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {

      // User is signed in.
      let userObj = {
        displayName:user.displayName,
        name:user.name,
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



useEffect(()=> {
  if (loggedInData!==null && loggedInData!==false) {
    firebase.firestore().collection('userData').doc(loggedInData.uid).get()
    .then(doc =>{
      setName(doc.data().name)
      setLoginDate(doc.data().lastLogin)
      setLocation(doc.data().location)
    })
    .catch(err => {
      setUserData(null)
    })
  } else {
    setUserData(null)
  }
},[loggedInData,dataRefresh])


    

  const openDialog = (obj) => {
    setDiagData(obj)
    setDialogOpen(true)
  }
  const welcomeBack = "Welcome Back: "
  const lastOnline = "Last online: "
  return (
    <div>
      <h2 style={{textAlign: 'left', paddingLeft: '18px', fontSize: '16px', paddingTop: '6px', }}>Dashboard </h2>

      <div style={{display: 'flex', flexDirection: 'column', paddingLeft: '18px'}}>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <p> </p>
          <p>{welcomeBack} {name} </p>
        </div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <p>{lastOnline} {loginDate}</p>
        </div>
        <CountryCards countries={location} ></CountryCards>
        <h2>
          Articles you are monitoring: 
      </h2> 

      </div>
      {/* {showReports &&  <List>{
        faveReportData.map((x,i)=><ListItem key={i} button onClick={()=>{openDialog(x)}}>{x.headline}</ListItem >)}
      </List>} */}

            <List>{
        faveReportData.map((x,i)=><ListItem key={i} button onClick={()=>{openDialog(x)}}>{x.headline}</ListItem >)}
      </List>
      {loader && <CircularProgress /> }



      <ReportDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} reportDetails={diagData}></ReportDialog>
      <div style={{paddingTop: '20px', paddingLeft: '18px'}}>
      
      </div>

    </div>
  );
}



const paragraphStyle = {
  fontSize : 18
}