import 'date-fns';
import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';


import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

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
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="Start Date"
          value={start}
          onChange={(date) => setStart(date)}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="End Date"
          value={end}
          onChange={(date) => setEnd(date)}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
      </Grid>
    </MuiPickersUtilsProvider>
  );
}
export default function CoverageGraph() {
    const initDate = new Date()
    initDate.setDate(new Date().getDate()-7)
    const [startDate, setStartDate] = React.useState(initDate);
    const [endDate, setEndDate] = React.useState(new Date());
    const [articleData, setArticleData] = React.useState([])
    const [caseData, setCaseData] = React.useState([])

    useEffect(() => {
        const startYearStr = startDate.getFullYear()
        let startMonth = String(startDate.getMonth()+1)
        const startMonthStr = (startMonth.padStart(2,'0'))
        let startDay = String(startDate.getDate())
        const startDateStr = startDay.padStart(2,'0')

        const endYearStr = endDate.getFullYear()
        let endMonth = String(endDate.getMonth()+1)
        const endMonthStr = (endMonth.padStart(2,'0'))
        let endDay = String(endDate.getDate())
        const endDateStr = endDay.padStart(2,'0')       

        fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/coverage?STart_DAte=${startYearStr}-${startMonthStr}-${startDateStr}&end_date=${endYearStr}-${endMonthStr}-${endDateStr}&key_terms=coronavirus`)
        .then(response => {
            return response.json()
        })
        .then(data => {
            setArticleData(data.map(x=>[x.day,x.articles]))
        })

        fetch(`https://us-central1-seng3011-hi-4.cloudfunctions.net/app/cases?STart_DAte=${startYearStr}-${startMonthStr}-${startDateStr}&end_date=${endYearStr}-${endMonthStr}-${endDateStr}&key_terms=coronavirus`)
        .then(response => {
            return response.json()
        })
        .then(data => {
            setCaseData(data.map(x=>[x.day,x.articles]))
        })
    },[startDate,endDate])


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

    const cases = {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: 'Coronavirus cases'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Articles'
            },
            min: 0
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
      
        series: [{
            type: 'area',
            name: 'Coronavirus cases',
            data: caseData
        }]
      }

      const articles = {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: 'Coronavirus news coverage'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Articles'
            },
            min: 0
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
      
        series: [{
            type: 'area',
            name: 'Coronavirus articles',
            data: articleData
        }]
      }


    return (
        <>
            <TimePickers start={startDate} setStart={startSetter} end={endDate} setEnd={endSetter}></TimePickers>
            <HighchartsReact
            highcharts={Highcharts}
            options={articles}
            />
            <HighchartsReact
            highcharts={Highcharts}
            options={cases}
            />
        </>
    )
}