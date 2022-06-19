import React from "react";
import { CountryMapComponent } from "../components/CountryMapComponent"
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export class HomePage extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if (this.props.location.state!=undefined) {
      toast.info(this.props.location.state.message);
    }
  }

  render() {
    return (
        <>
        <CountryMapComponent></CountryMapComponent></>
    )
  }
}