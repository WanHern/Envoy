import React from "react";
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

import { withTheme } from '@material-ui/core/styles';


// const mapData = require("@highcharts/map-collection/custom/world-eckert3-highres.geo.json")
const auMapData = require("@highcharts/map-collection/countries/au/au-all.geo.json")
const chMapData = require("@highcharts/map-collection/countries/cn/custom/cn-all-sar.geo.json")
const cnMapData = require("@highcharts/map-collection/countries/ca/ca-all.geo.json")

highchartsMap(Highcharts);
drilldow(Highcharts);
dataModule(Highcharts);

const auData = Highcharts.geojson(auMapData)
const chData = Highcharts.geojson(chMapData)
const cnData = Highcharts.geojson(cnMapData)

// var separators = Highcharts.geojson(auMapData,"mapline");

const reMapping = {
  "Inner Mongolia": "Inner Mongol",
  "Tibet": "Xizang",
  "Quebec":"Québec"
}


window.Highcharts = Highcharts;

export class CountryMapComponentDetailedRaw extends React.Component {
  constructor(props) {
    super(props)
    this.state={loaded:false,options:{},country:""}
  }
    render() {
      if (this.props.country != this.state.country) {
        fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/COVIDCaseData`)
        .then(data=>data.json())
        .then(data => {
          let mapData = null
          if (this.props.country==="Australia") mapData = auData
          if (this.props.country==="China") mapData = chData
          if (this.props.country==="Canada") mapData = cnData
          if (mapData===null ) throw new Error(`Country name ${this.state.country} is not supported for deatailed map`)
    
    
          const filteredData = data.filter(x=>x['Province/State']!=null && x['Province/State']!=x.Country).filter(x=>x.Country===this.props.country)
          console.log(filteredData)
          filteredData.forEach(x=>{
            if (reMapping[x['Province/State']]!=undefined) x['Province/State']=reMapping[x['Province/State']]
          })
          filteredData.forEach(x=>{
            const mapOBJ = mapData.find(y=>y.name===x['Province/State'])
            if (mapOBJ!=undefined) {
              mapOBJ.value = x.Confirmed
              mapOBJ.recovered = x.Recovered
              mapOBJ.deaths = x.Deaths
            }
          }    
          )
          filteredData.forEach(x=>{
            if (x.value===undefined) {
              x.value=null
              x.recovered = null
              x.deaths = null
            }
          })
          this.setState({
            loaded:true,
            country:this.props.country,
            options:{
              tooltip: {
                formatter: function(){
                    var s = this.key + '<br/>';
                    s += 'Confirmed:' + this.point.value + '<br/>';
                    s += 'Recovered:' + this.point.recovered + '<br/>' ;
                    s += 'Deaths:' + this.point.deaths
                    return s;
                },
            },
              chart: {
                height:700,   
                backgroundColor: this.props.theme.palette.background.default,      
              },
              title: {
                text: "COVID-19 Confirmed Cases"
              },
            
              legend: {
                layout: "vertical",
                align: "right",
                verticalAlign: "middle"
              },
            
              colorAxis: {
                min: 0,
                minColor: "#E6E7E8",
                maxColor: "#b12ff7"
              },
            
              mapNavigation: {
                enabled: true,
                buttonOptions: {
                  verticalAlign: "bottom"
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
            
              series: [
                {
                  point: {
                    events: {
                        click: this.openSidebar
                    }
                  },
                  data: mapData,
                  name: this.props.country,
                  tooltip: {
                    formatter: function(){
                      console.log(this);  
                    },
                    valueSuffix: ''
                }
                },
                // {
                //   type: "mapline",
                //   // data: separators,
                //   color: "silver",
                //   enableMouseTracking: false,
                //   animation: {
                //     duration: 500
                //   }
                // }
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
            }})
          })
      }
      if (this.state.loaded) {
        return (
        <>
          <MapSideBar open={this.state.sidebarOpen} country={this.state.country} setClose={this.closeSidebar}></MapSideBar>
          <HighchartsReact
            ref={"chartComponent"}
            constructorType ={'mapChart'}
            highcharts={Highcharts}
            options={this.state.options}
        />
      </>)
      } else {
        return (<div style={{display: 'flex', justifyContent: 'center'}}>
          <CircularProgress />
        </div>)
      }

    }
  }

  export const CountryMapComponentDetailed = withTheme(CountryMapComponentDetailedRaw);

const useStyles = makeStyles({
    list: {
      width: 250,
    },
    fullList: {
      width: 'auto',
    }
  });


function MapSideBar(props) {
    const classes = useStyles();
    const {open,setClose, country} = props
  
    const toggleDrawer = (anchor, open) => event => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
      setClose(false)
    };
  
    return (
      <div>
          <React.Fragment key={"right"}>
            {open ? <Drawer anchor={"right"} open={open} onClose={toggleDrawer("right", false)}>


            <List>
              <ListItem button key={"home"} >David's Stuff here</ListItem>
              <ListItem button key={"home"} >Country name: {country}</ListItem>
            </List>


            
            </Drawer> : null}
          </React.Fragment>
      </div>
    );
  }