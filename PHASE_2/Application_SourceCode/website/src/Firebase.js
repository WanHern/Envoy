// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";

// const admin = require('firebase-admin');
// const app = require('express')();W

// admin.initializeApp();

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};


// ;

// export default firebase

export default !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// const firebaseAuth = firebase.auth()

// export { firebaseAuth }