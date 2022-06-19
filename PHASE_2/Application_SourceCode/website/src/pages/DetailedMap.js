import React, {useEffect, useState} from "react";
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { CountryMapComponentDetailed } from "../components/CountryMapComponentDetailed"
const paragraphStyle = {
    fontSize : 18
}


function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export function DetailedMap() {
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const country = {
    0:"Australia",
    1:"Canada",
    2:"China"
  }
  return (
    <Container maxWidth="md">
      <h2>Detailed Map</h2>
      <p>In addition to the world map, detailed province level data is also available for Australia, Canada, China,  </p>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Australia" {...a11yProps(0)} />
          <Tab label="Canada" {...a11yProps(1)} />
          <Tab label="China" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
        <CountryMapComponentDetailed country={country[value]}></CountryMapComponentDetailed>
    </Container>
  );
}