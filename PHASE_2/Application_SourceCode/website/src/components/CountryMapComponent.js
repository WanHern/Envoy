import React, {useState, useEffect} from "react";
import clsx from 'clsx';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMap from "highcharts/modules/map";
import drilldow from "highcharts/modules/drilldown";
import dataModule from "highcharts/modules/data";
import CircularProgress from '@material-ui/core/CircularProgress';

import { makeStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';

import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { CountryMapComponentDetailed } from './CountryMapComponentDetailed';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Grid from '@material-ui/core/Grid';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import  firebase  from '../Firebase.js';
import * as firebase2 from 'firebase';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';

import { withTheme } from '@material-ui/core/styles';

import {
  // BrowserRouter as Router,
  // Switch,
  // Route,
  Link
} from "react-router-dom";


import {countryCodes} from "../static/CountryCodes"
import { Container } from "@material-ui/core";

const mapData = require("@highcharts/map-collection/custom/world-eckert3-highres.geo.json")

highchartsMap(Highcharts);
drilldow(Highcharts);
dataModule(Highcharts);

const data2 = Highcharts.geojson(mapData)
var separators = Highcharts.geojson(mapData,"mapline");
console.log(data2.map(x=>{
  return {
    name:x.name,
    iso2:x.properties["iso-a2"],
    iso3:x.properties["iso-a3"]
  }
}))
window.Highcharts = Highcharts;




class CountryMapComponentRaw extends React.Component {
  constructor(props) {
    super(props)
    this.state={loaded:false,options:{},sidebarOpen:false,country:"",mapType:"confirmed"}
  }
  fixedOptions = {
    chart: {
        height:700,  
        backgroundColor: this.props.theme.palette.background.default,
        displayErrors: false
    },
    title: {
      text: ""
    },    
    mapNavigation: {
        enabled: true,
        buttonOptions: {
            verticalAlign: "bottom"
        },
        title: {
          text: 'Population density per km²',
          style: {
              color: 'black'
          }
      }
    },
    plotOptions: {
        map: {
            states: {
            hover: {
                color: "#EEDD66"
            }
            }
        }
    },
  }
  componentDidMount() {
    fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/COVIDCaseData`)
    .then(data=>data.json())
    .then(data => {
      data.forEach(x=>{
        // console.log(x.Country)
        let CodeObj
        if (x['Province/State']!=null && x['Province/State']!=x.Country) {
          if (x.Country==="Denmark" && x['Province/State']==="Greenland") {
            CodeObj = countryCodes.find(y=>{
              return y.Name==="Greenland"
            })
          } else {return}
        } else {
          CodeObj = countryCodes.find(y=>{
            return y.Name===x.Country
          })
        }
        if (CodeObj!=undefined) {
            const obj = data2.find(x=>x.properties['hc-a2']===CodeObj.Code)
            if(obj != undefined) {
              obj.value = x.Confirmed
              obj.infectionsPerCapita = parseInt(((x.Confirmed/x.pop)*100000))
              obj.deathRate = parseInt((x.Deaths/x.Confirmed)*100)
              obj.recoveryRate = parseInt((x.Recovered/x.Confirmed)*100)
              obj.confirmed = x.Confirmed
              obj.recovered = x.Recovered
              obj.deaths = x.Deaths
            }
          }
        }
        
      )
      data2.forEach(x=>{
        if (x.value===undefined) {
          x.value=NaN
          x.recovered = NaN
          x.deaths = NaN
        }
      })


      this.setState({
        loaded:true,
        options:{...{
          tooltip: {
            formatter: function(){
                var s = this.key + '<br/>';
                s += 'Infections per 100:' + this.point.infectionsPerCapita + '<br/>';
                s += 'Confirmed:' + this.point.confirmed + '<br/>';
                s += 'Recovered:' + this.point.recovered + '<br/>' ;
                s += 'Deaths:' + this.point.deaths
                return s;
            },
          },
          legend: {
            layout: "horizontal",
            align: "center",
            verticalAlign: "bottom",
            title: {
              text: 'Confirmed Cases'
            },
        },
          colorAxis: {
            min: 0,
            minColor: "#FFFFFF",
            maxColor: "#b12ff7"
          },     
          series: [
            {
              point: {
                events: {
                    click: this.openSidebar
                }
              },
              data: data2,
              name: "World",
              dataLabels: {
                enabled: true,
                format: "{point.properties.postal-code}"
              },
              tooltip: {
                formatter: function(){
                  console.log(this);  
                },
                valueSuffix: ''
              }
            },
            {
              type: "mapline",
              data: separators,
              color: "silver",
              enableMouseTracking: false,
              animation: {
                duration: 500
              }
            }
          ],
        },...this.fixedOptions}})
    })
  }

  closeSidebarunbound = () => {this.setState({sidebarOpen:false})}
  closeSidebar = this.closeSidebarunbound.bind()

  openSidebarunbound = (e) => {this.setState({sidebarOpen:true,country:e.point.name})}
  openSidebar = this.openSidebarunbound.bind()


  mapSetter = (selection) => {
    const oldData = this.state.options.series[0].data

    const newData = oldData.map(obj=>{
      obj.value = obj[selection]
      return obj
    })
    newData.forEach(x=>{
      if (x.value===undefined) {
        x.value=NaN
        x.recovered = NaN
        x.deaths = NaN
      }
    })
    this.setState({mapType:selection,options:{...{
      tooltip: {
        formatter: function(){
            var s = this.key + '<br/>';
            switch(selection) {
              case "confirmed":
                break;
              case "infectionsPerCapita":
                s += 'Infections per 100,000:' + this.point.infectionsPerCapita + '<br/>';
                break;
              case "deathRate":
                s += 'Death Rate:' + this.point.deathRate + '%<br/>';
                break;
              case "recoveryRate":
                s += 'Recovery Rate:' + this.point.recoveryRate + '%<br/>';
                break;
            }
            
            s += 'Confirmed:' + this.point.confirmed + '<br/>';
            s += 'Recovered:' + this.point.recovered + '<br/>' ;
            s += 'Deaths:' + this.point.deaths
            return s;
        },
      },

      colorAxis: {
        min: 0,
        minColor: "#FFFFFF",
        maxColor: selection === "recoveryRate" ? "#44DD77" : ( selection === "deathRate" ? "#FF2244" : "#b12ff7")
      },   
      legend: {
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
        title: {
          text: selection === "confirmed" ? "Confirmed Cases" : (selection === "infectionsPerCapita" ? "Confirmed Cases per 100,000" : (selection === "deathRate" ? "Death rate %" : "Recovery Rate %"))
        },
    },
      series: [
        {
          point: {
            events: {
                click: this.openSidebar
            }
          },
          data: newData,
          name: "World",
          dataLabels: {
            enabled: true,
            format: "{point.properties.postal-code}"
          },
          tooltip: {
            formatter: function(){
              console.log(this);  
            },
            valueSuffix: ''
        }
        },
        {
          type: "mapline",
          data: separators,
          color: "silver",
          enableMouseTracking: false,
          animation: {
            duration: 500
          }
        }
      ],
    
      drilldown: {
        activeDataLabelStyle: {
          color: "#FFFFFF",
          textDecoration: "none",
          textOutline: "1px #000000"
        },
        drillUpButton: {
          relativeTo: "spacingBox",
          position: {
            x: 0,
            y: 60
          }
        }
      }
    },...this.fixedOptions}})


  }








    render() {
      
      if (this.state.loaded) {
        return (
        <>
          <MapSideBar open={this.state.sidebarOpen} country={this.state.country} setClose={this.closeSidebar}></MapSideBar>
          <Grid container justify = "center">
            <h2>CovID-19 By County</h2>
          </Grid>
          <Grid container justify = "center">
            <ButtonGroup color="primary" aria-label="outlined primary button group">
              <Button onClick={()=>this.mapSetter("confirmed")} variant={this.state.mapType==="confirmed" ? "contained" : null}>Absolute Infections</Button>
              <Button onClick={()=>this.mapSetter("infectionsPerCapita")} variant={this.state.mapType==="infectionsPerCapita" ? "contained" : null}>Infections per 100,000</Button>
              <Button onClick={()=>this.mapSetter("deathRate")} variant={this.state.mapType==="deathRate" ? "contained" : null}>Death Rate</Button>
              <Button onClick={()=>this.mapSetter("recoveryRate")} variant={this.state.mapType==="recoveryRate" ? "contained" : null}>Recovery Rate</Button>
            </ButtonGroup>
          </Grid>
          <Grid container justify = "center">
            <p>Note: Data is not available for all countries. Regions highlighted in black indicate a lack of data</p>
          </Grid>
          <HighchartsReact
            ref={"chartComponent"}
            constructorType ={'mapChart'}
            highcharts={Highcharts}
            options={this.state.options}
        />
      </>)
      } else {
        return (<div style={{display: 'flex', justifyContent: 'center'}}>
          <CircularProgress style={{position:'absolute',top:"40%"}}/>
        </div>)
      }

    }
  }


export const CountryMapComponent = withTheme(CountryMapComponentRaw);
function ConfirmButtonLocation(props) {
  const {loc} = props

  const handleClick = (event) => {
    console.log('Sending to location page with', loc)
  };
  var link = 'locationInfo/' +loc;

  return (
   
  <Button onClick={handleClick} variant="contained" color="primary" style={{position:'absolute', top:'57%', left: 25}} href={link} > 
    More details
  </Button>
  
  )
}

function ConfirmButtonEmail() {
  

  const handleClick = (event) => {
    console.log('Sending to location page')
  };

  return (
    <div>
  <Button onClick = {handleClick} variant="contained" color="primary" style={{position:'absolute', top:'120%', right: 10}} > 
    Update settings
  </Button>
  </div>
  )
}

function EmailSettings() {
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

  return (
    <FormControl component="fieldset">
    <FormLabel component="legend"></FormLabel>
    <RadioGroup row aria-label="position" name="position" defaultValue="top"  onChange={handleChange}>
      <FormControlLabel
        value="none"
        control={<Radio color="primary" />}
        label="None"
      />
      <FormControlLabel
        value="daily"
        control={<Radio color="primary" />}
        label="Daily"
      />
      <FormControlLabel
        value="weekly"
        control={<Radio color="primary" />}
        label="Weekly"
      />
      <FormControlLabel
        value="monthly"
        control={<Radio color="primary" />}
        label="Monthly"
      />

    </RadioGroup>


  </FormControl>
  )
}

function ReportDialog(props) {
  const {dialogOpen,setDialogOpen,reportDetails, location} = props

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

function DetailedMapDialog(props) {
  const {dialogOpen,setDialogOpen,country} = props

  return (
  <Dialog
    onClose={()=>setDialogOpen(false)}
    aria-labelledby="customized-dialog-title" 
    open={dialogOpen}
    fullWidth={true}
    maxWidth={"lg"}
  >
    <DialogTitle id="customized-dialog-title" onClose={()=>setDialogOpen(false)}>
      Detailed Map for {country}
    </DialogTitle>
    <DialogContent dividers>
      <CountryMapComponentDetailed country={country}></CountryMapComponentDetailed>
    </DialogContent>
    <DialogActions>
      <Button autoFocus onClick={()=>setDialogOpen(false)} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
  )
}

export default function SwitchesGroup(country) {
  console.log(country.children)
  const [state, setState] = React.useState({
    selected: false,
  });
  const {countryVal} = country;
  const [loggedInData, setLoggedInData] = useState(null)
  const [location, setLocation] = useState("")
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
    if (loggedInData) {
      setState({ ...state, [event.target.name]: event.target.checked });
      if (event.target.checked == true) {
        firebase2.firestore().collection('userData').doc(loggedInData.uid).update({
          location: firebase2.firestore.FieldValue.arrayUnion(country.children)     
        });
        toast.info("Notifications succesfully added for " + country.children)
      } else {
        firebase2.firestore().collection('userData').doc(loggedInData.uid).update({
          location: firebase2.firestore.FieldValue.arrayRemove(country.children)       
        });
        toast.info("Notifications for " + country.children + " have been removed")
      }
      
    } else {
      toast.info("Log in to change your email settings")
    }
  };

  useEffect(()=> {
    if (loggedInData!==null && loggedInData!==false) {
      firebase.firestore().collection('userData').doc(loggedInData.uid).get()
      .then(doc =>{
        console.log(doc.data().location)
        if (doc.data().location.indexOf(country.children)!=-1) {
          setState({ ...state, selected: true });
        } else {
          setState({ ...state, selected: false });
        }
      })
      .catch(err => {
        setState({ ...state, selected: false });
      })
    } else {
      setState({ ...state, selected: false });
    }
    
  },[loggedInData,country.children])
  return (
    
    <FormControl component="fieldset" style={{position:'absolute',top:"63%",left:"8%", width:200}}>
      
      <FormLabel component="legend">Get email notifications</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={state.selected} onChange={handleChange} color="primary" name="selected" />}
        />
      </FormGroup>
      {/*<FormHelperText>Set frequency in profile page</FormHelperText>*/}
    </FormControl>
  );
}


const useStyles = makeStyles({
    list: {
      width: 100,
    },
    fullList: {
      width: 100,
    },

  });


function MapSideBar(props) {
    const classes = useStyles();
    const {open,setClose, country} = props
    const initDate = new Date()
    initDate.setDate(new Date().getDate()-50)
    const [startDate, setStartDate] = React.useState(initDate);
    const [endDate, setEndDate] = React.useState(new Date());
    const [reportData, setReportData] = React.useState([])
    const [showReports, setShowReports] = React.useState(true)
    const [location, setLocation] = React.useState("Australia")
    const [keyWords, setKeyWords] = React.useState("Coronavirus")
    const [loader, setLoader] = React.useState(true);

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [mapDialogOpen, setMapDialogOpen] = React.useState(false)
    const [reportDetails, setReportDetails] = React.useState({})
    const openFunction = () => {
      console.log("Should update location here")
      setLocation(country)
      
      return true;
    };    

    const toggleDrawer = (anchor, open) => event => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
      setClose(false);

    };

    const openDialog = (obj) => {
      setReportDetails(obj)
      setDialogOpen(true)
    }
  

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
      const place = country
      
      setLoader(true);
      setShowReports(false);
      
      fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/reports?STart_DAte=${startYearStr}-${startMonthStr}-${startDateStr}T${startHourStr}:${startMinStr}:00&end_date=${endYearStr}-${endMonthStr}-${endDateStr}T${endHourStr}:${endMinStr}:00&key_terms=${keyWords}&location=${place}&num=5`)
      .then(response => {
        if (response.status===200) {
          return response.json()
        } else {
          response.text().then(x=>{console.log(x)})
          throw "Error"
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

  
    },[country])



  
    return (
      <div>
        
          <React.Fragment key={"right"}>
            {open ? <Drawer anchor={"right"} open={open} location={country} onClose={toggleDrawer("right", false) }>
            
            
            <List style={{overflow:'hidden', border:"15", backgroundColor:"#110051",height:950, width: 360}}>
            
            
              <ListItem button key={"home"} style={{top:-10,height:950, width: 330, left:0, backgroundColor:"#ffffff"}}>
              {loader && <CircularProgress  style={{position:'absolute', top:'25%', left:"35%"}}/> }
                 < h2 style={{position:'absolute', top:12, left: 25}}>Latest Articles for {country}</h2>
                <SwitchesGroup>{country}</SwitchesGroup>
                
                {showReports && <List style={{top:-200}}>{
                  
                  reportData.map((x,i)=><ListItem key={i} button onClick={()=>{openDialog(x)}}>{x.headline} </ListItem >)}
                </List>}
                
                
                {country === "Australia" || country === "Canada" || country === "China" ? <Button onClick = {()=>setMapDialogOpen(true)} variant="contained" color="primary"  style={{position:'absolute', top:'57%', left: 170}}> 
                  Detailed Map
                  
                </Button> : null}
                <ConfirmButtonLocation loc={country}></ConfirmButtonLocation>
              </ListItem>
              
              {/*<ListItem button key={"home"} style={{width:350, backgroundColor:'#e0e0e0', height:350,flex: 1, justifyContent: 'start', alignItems: 'center', overflow:'hidden'}}>
                  
                <h2 style={{position:'absolute', top:0, left: 10}}>Get notifications for {country}</h2>
                <EmailSettings></EmailSettings>

                
              </ListItem>*/}
              
            </List>

            
            
            </Drawer> : null}
          </React.Fragment>
          
          <ReportDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} reportDetails={reportDetails} location={country}></ReportDialog>
          <DetailedMapDialog dialogOpen={mapDialogOpen} setDialogOpen={setMapDialogOpen} country={country}></DetailedMapDialog>
      </div>
    );
  }