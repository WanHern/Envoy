import React, {useState, useEffect} from "react";
import clsx from 'clsx';
import Highcharts, { Data } from "highcharts";
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

import { withTheme } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import {
  // BrowserRouter as Router,
  // Switch,
  // Route,
  Link
} from "react-router-dom";

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';


export function CountryCards(props) {
    const {countries} = props
    const [dataset, setDataset] = React.useState([])
    const [highlighted, sethighlighted] = React.useState("")
    useEffect(()=>{
        fetch(`https://datahub.io/core/covid-19/r/time-series-19-covid-combined.json`)
        .then(data=>data.json())
        .then(data=>{
            const countryMapped = countries.map(x=>{
                const filteredData = data.filter(y=>x===y['Country/Region'])
                if (filteredData[0]['Province/State']!==null) {
                    // Get all unique dates
                    const uniqueDates = filteredData.map(y=>y.Date).filter((y,i,arr)=>arr.indexOf(y)===i)
                    const condensed = uniqueDates.map(date=>{
                        return filteredData.filter(obj=>obj.Date===date).reduce((prev,curr,i,arr) => {
                            let next = {}
                            next['Country/Region'] = x
                            next.Confirmed = prev.Confirmed + curr.Confirmed
                            next.Recovered = prev.Recovered + curr.Recovered
                            next.Deaths = prev.Deaths + curr.Deaths
                            next.Date = date
                            return next
                        },{
                            'Country/Region': x,
                            Confirmed:0,
                            Recovered:0,
                            Deaths:0,
                            Date:date
                        })

                    })
                    return condensed
                }
                return filteredData
            })
            console.log(countryMapped)
            setDataset(countryMapped)

        }) 
    },[countries])



    const useStyles = makeStyles((theme) => ({
      root: {
        flexGrow: 1,
      },
      paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      },
    }));


    const classes = useStyles();
    return (
      <div className={classes.root}>
      <Grid container spacing={3}>

      {dataset.map(x=>{
         const lastFew =  x.slice(x.length-8,x.length)
         let diff=[]
         for (var i=1;i<lastFew.length;i++) {
          diff.push({name:lastFew[i].Date,NewCases:lastFew[i].Confirmed-lastFew[i-1].Confirmed})
         }
        return (
          
          <Grid item xs={highlighted === x[0]['Country/Region'] ? 4 : 2}>
            <Card style={{display: 'inline-block'}}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {x[0]['Country/Region']} daily cases
                </Typography>

                {highlighted === x[0]['Country/Region'] ? 

                <BarChart width={350} height={200} data={diff} onMouseEnter={()=>sethighlighted(x[0]['Country/Region'])} onMouseLeave={()=>sethighlighted("")}>
                  <Bar dataKey="NewCases" fill="#8884d8" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </BarChart>
                :
                <BarChart width={140} height={40} data={diff} onMouseEnter={()=>sethighlighted(x[0]['Country/Region'])}>
                  <Bar dataKey="NewCases" fill="#8884d8" />
                </BarChart>}

              </CardContent>
            </Card>
          </Grid>
      )})}
        </Grid>
        </div>
    )
}