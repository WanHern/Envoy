import React from "react";


import { makeStyles } from '@material-ui/core/styles';

export class EmailSender extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        targetEmail: "Email",
        subject: "Covid19 discovered near your area!",
        message: "",
      };
  
      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

    }
    
    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
          [name]: value
        });
      }

      handleSubmit(event) {
        const requestOptions = {
            mode: 'no-cors',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email: this.state.targetEmail, subject: this.state.subject, html: this.state.message})
        };
        fetch('http://68.183.181.137:3000/send', requestOptions)
            .then(response => response.status);
        alert("Email has been sent!");
        event.preventDefault();
      }
        render() {
            return (
            
              <div>
                <form onSubmit={this.handleSubmit}>
                <label style={{"display":"flex","width":"250px","justifyContent":"space-between"}}>
                Target Email:
                <input
                    name="targetEmail"
                    type="text"
                    value={this.state.targetEmail}
                    onChange={this.handleInputChange} />
                </label>
                <br />

                <label style={{"display":"flex","width":"250px","justifyContent":"space-between"}}>
                Subject:
                <input
                    name="subject"
                    type="text"
                    value={this.state.subject}
                    onChange={this.handleInputChange} />
                </label>
                <br/>
                <label style={{"display":"flex","width":"250px","justifyContent":"space-between"}}>
                Message:
                <input
                    name="message"
                    type="text"
                    value={this.state.message}
                    onChange={this.handleInputChange} />
                </label>
                <br/>
                <input type="submit" value="Submit" />
            </form>
            </div>
            );
        }
    }

