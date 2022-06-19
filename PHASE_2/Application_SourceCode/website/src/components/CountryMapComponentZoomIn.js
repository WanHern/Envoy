import React from "react";
// import clsx from 'clsx';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMap from "highcharts/modules/map";
import drilldow from "highcharts/modules/drilldown";
import dataModule from "highcharts/modules/data";
import CircularProgress from '@material-ui/core/CircularProgress';

import {countryCodes} from "../static/CountryCodes"
const mapData = require("@highcharts/map-collection/custom/world-eckert3-highres.geo.json")

highchartsMap(Highcharts);
drilldow(Highcharts);
dataModule(Highcharts);

const data2 = Highcharts.geojson(mapData)
var separators = Highcharts.geojson(mapData,"mapline");

window.Highcharts = Highcharts;

export class CountryMapComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state={loaded:false,options:{}}
  }
  componentDidMount() {
    fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/COVIDCaseData`)
    .then(data=>data.json())
    .then(data => {
      data.forEach(x=>{
        const CodeObj = countryCodes.find(y=>{
          return y.Name===x.Country
        })
        if (CodeObj!=undefined) {
            const obj = data2.find(x=>x.properties['hc-a2']===CodeObj.Code)
            if(obj != undefined) {
              obj.drilldown = obj.properties["hc-key"]
              obj.value = x.Confirmed
              obj.recovered = x.Recovered
              obj.deaths = x.Deaths
            }
          }
        }
        
      )
      data2.forEach(x=>{
        if (x.value===undefined) {
          x.drilldown = x.properties["hc-key"]
          x.value=0
          x.recovered = 0
          x.deaths = 0
        }
      })
      this.setState({
        loaded:true,
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
            events: {
              drilldown: function(e) {
                if (!e.seriesOptions) {
                  var chart = this,
                    mapKey = `countries/${e.point.drilldown}/` + e.point.drilldown + "-all",
                    // Handle error, the timeout is cleared on success
                    fail = setTimeout(function() {
                      if (!Highcharts.maps[mapKey]) {
                        chart.showLoading(
                          '<i class="icon-frown"></i> Failed loading ' + e.point.name
                        );
                        fail = setTimeout(function() {
                          chart.hideLoading();
                        }, 1000);
                      }
                    }, 3000);
        
                  // Show the spinner
                  chart.showLoading('<i class="icon-spinner icon-spin icon-3x"></i>'); // Font Awesome spinner
        
                  // Load the drilldown map
                  console.log("https://code.highcharts.com/mapdata/" + mapKey + ".geo.json")
                  fetch("https://code.highcharts.com/mapdata/" + mapKey + ".geo.json")
                  .then(x=>x.json())
                  .then(JSONdata=>{
                    // console.log(JSONdata)
                    data = Highcharts.geojson(JSONdata)
                    console.log(data)
                    if (JSONdata.title==="Australia") {
                      const NSW = data.find(x=>x.name==="New South Wales")
                      NSW.value = 2580
                      NSW.recovered =634 
                      NSW.deaths = 16

                      const VIC = data.find(x=>x.name==="Victoria")
                      VIC.value = 1115
                      VIC.recovered = 527 
                      VIC.deaths = 8

                      const QLD = data.find(x=>x.name==="Queensland")
                      QLD.value = 907
                      QLD.recovered = 8 
                      QLD.deaths = 3

                      const WA = data.find(x=>x.name==="Western Australia")
                      WA.value = 400
                      WA.recovered = 0 
                      WA.deaths = 3

                      const SA = data.find(x=>x.name==="South Australia")
                      SA.value = 407
                      SA.recovered = 46 
                      SA.deaths = 3

                      const TAS = data.find(x=>x.name==="Tasmania")
                      TAS.value = 82
                      TAS.recovered = 13 
                      TAS.deaths = 2

                      const NT = data.find(x=>x.name==="Northern Territory")
                      NT.value = 21
                      NT.recovered = 13 
                      NT.deaths = 0
        
                      const ACT = data.find(x=>x.name==="Australian Capital Territory")
                      ACT.value = 87
                      ACT.recovered = 11 
                      ACT.deaths = 2

                      const NF = data.find(x=>x.name==="Norfolk Island")
                      NF.value = 0
                      NF.recovered = 0
                      NF.deaths = 0

                      const JB = data.find(x=>x.name==="Jervis Bay Territory")
                      JB.value = 0
                      JB.recovered = 0
                      JB.deaths = 0

                    } else {
                      // Set a non-random bogus value
                      data.forEach((x,i) => {
                        x.value=i
                      })
                    }

        
                    // Hide loading and add series
                    chart.hideLoading();
                    clearTimeout(fail);
                    chart.addSeriesAsDrilldown(e.point, {
                      name: e.point.name,
                      data: data,
                      dataLabels: {
                        enabled: true,
                        format: "{point.name}"
                      }
                    });
                  })
                }
        
                this.setTitle(null, { text: e.point.name });
              },
              drillup: function() {
                this.setTitle(null, { text: "" });
              }
            },
            height:700,
            
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
            maxColor: "#FF6600"
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


    render() {
      if (this.state.loaded) {
        return (<HighchartsReact
          ref={"chartComponent"}
          constructorType ={'mapChart'}
          highcharts={Highcharts}
          options={this.state.options}
      />)
      } else {
        return (<div style={{display: 'flex', justifyContent: 'center'}}>
          <CircularProgress />
        </div>)
      }

    }
  }