// This file contains the source code for the Firebase Functions.
// It contains endpoints and scheduled functions that support both the reports endpoint and various parts of the frontend web application.


const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch')

const emailTemplate = require('./EmailTemplate')
const googleMapsClient = require('@google/maps').createClient({
    key: ''
  });

const cred = admin.credential.cert('seng3011-hi-4-firebase-key.json')

// Realtime
// var defaultApp = admin.initializeApp({credential:cred,databaseURL:'https://seng3011-hi-4.firebaseio.com/'});
  
var defaultApp = admin.initializeApp({credential: cred});
  

var CountryCodes2 = require("./CountryCodes2")


// var defaultDatabase = defaultApp.database();
var firestoreDB = admin.firestore()
// var ref = defaultDatabase.ref("server/python");


const app = express();
app.use(cors({ origin: true }));


exports.helloWorld = functions.https.onRequest((req, res) => {
    const ref = firestoreDB.collection("users").doc('park@mail.com');
    ref.get().then(function(doc) {
        if (doc.exists) {
            res.send(doc.data().location);
        } else {
            // doc.data() will be undefined in this case
            res.send("no user found");
        }
        return
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
});

app.get('/coverage',(req, res) => {
    articleCounter(req,res,articleFilter,articleFilterLocation)
    return
})

app.get('/cases',(req, res) => {
    articleCounter(req,res,casesFilter,casesFilterLocation)
    return
})



app.get('/ipToLocation',async (req, res) => {
    if (!Object.keys(req.query).includes("ip")) {
        return res.status(400).send("ip key missing")
    }
    var response = await fetch(`http://api.db-ip.com/addrinfo?api_key=&addr=${req.query.ip}`);
    location = await response.json();

    return res.status(200).json(location)
})


function articleCounter(req,res,snapshoter,snapshoterLocation) {
    const requiredkeys = ['start_date','end_date']
    const allowedKeys = ['start_date','end_date','key_terms','location','page','num']
    let keys = Object.keys(req.query)
    let keysLower = keys.map(x=>x.toLowerCase())
    const missingKeys = requiredkeys.filter(x=>!keysLower.includes(x))
    const extraKeys = keysLower.filter(x=>!allowedKeys.includes(x))

    if ( missingKeys.length > 0 && extraKeys.length === 0 ) {
        writeLog(req,400)
        return res.status(400).send('Missing following keys: ' + missingKeys.join(", "));
    }
    if ( missingKeys.length === 0 && extraKeys.length > 0 ) {
        writeLog(req,400)
        return res.status(400).send('Extra keys: ' + extraKeys.join(", "));
    }
    if ( missingKeys.length > 0 && extraKeys.length > 0 ) {
        writeLog(req,400)
        return res.status(400).send('Missing following keys: ' + missingKeys.join(", ") + ". And found extra keys: " + extraKeys.join(", "));
    }


    let keyTermsSent = false
    if (keysLower.includes('key_terms')) keyTermsSent=true
    let locationSent = false
    if (keysLower.includes('location')) locationSent=true

    const startDateString = req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'start_date')]
    const endDateString = req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'end_date')]
    const keyTermString = (keyTermsSent ? req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'key_terms')] : "")
    const locationString = (locationSent ? req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'location')] : "")

    let startTime = stringToDayTimeStamp(startDateString)
    let endTime = stringToDayTimeStamp(endDateString)
    if(startTime===null) {
        writeLog(req,400)
        return res.status(400).send('Invalid Start Time. Format: YYYY-MM-DD')
    }
    if(endTime===null) {
        writeLog(req,400)
        return res.status(400).send('Invalid End Time. Format: YYYY-MM-DD')
    }
    if (startTime.toMillis() > endTime.toMillis()) {
        writeLog(req,400)
        return res.status(400).send('Invalid Time String. End Date is earlier than start date.')
    }


    

    let keyTermsTrimmed = ""
    if (keyTermsSent) {
        let keyTermMatch = keyTermString.match("^((?:[^,]+,)*)([^,]+)$")
        if (keyTermMatch===null) {
            writeLog(req,400)
            return res.status(400).send('Invalid key_terms string. Please provide a comma seperated list of terms to filter by') 
        }

        let keyTerms = keyTermMatch[1].split(",").filter(x => x!=="")
        keyTerms.push(keyTermMatch[2])
        keyTermsTrimmed = keyTerms.map(x=>x.trim().toLowerCase())  
    }

    

    let returnArr = []
    const ref = firestoreDB.collection('articles')

    let startDate = startTime.toDate()
    let endDate = endTime.toDate()

    while (startDate < endDate) {
        tempobj = {day:startDate.getTime(), articles: 0}
        returnArr.push(tempobj)
        startDate.setDate(startDate.getDate() + 1)
    }
    
    const baseQuery = ref.where('date_of_publication',">",startTime)
    .where('date_of_publication',"<",endTime)
    .orderBy('date_of_publication','desc')

    if (locationSent) {
        if (locationString.length === 0) return res.status(400).send('Invalid Location Format. Ensure a location is provided')


        googleMapsClient.geocode({
            address: locationString
          }, async (err, response) => {
            if (!err) {

                if (response.json.results.length ===0) {
                    writeLog(req,400)
                    res.status(400).send("Error: Unable to find the referenced location. Please check spelling and try again")
                    return
                }
                for (const locationOBJ of response.json.results) {
                    let latLow = locationOBJ.geometry.bounds.southwest.lat
                    let latHigh = locationOBJ.geometry.bounds.northeast.lat
                    let lngLow = locationOBJ.geometry.bounds.southwest.lng
                    let lngHigh = locationOBJ.geometry.bounds.northeast.lng

                    let lngFlipped = false
                    if (lngLow > lngHigh) {
                        lngFlipped = true}

                    if (!lngFlipped) {
                        if ((latHigh - latLow)*(lngHigh-lngLow) < 4) {
                            latLow = locationOBJ.geometry.location.lat - 1
                            latHigh = locationOBJ.geometry.location.lat + 1
                            lngLow = locationOBJ.geometry.location.lng - 1
                            lngHigh = locationOBJ.geometry.location.lng + 1
                        }
                    }

                    if (keyTermsSent) {
                        //es-lint
                        const queryRes = await baseQuery.where('keywords','array-contains-any',keyTermsTrimmed).get() // eslint-disable-line no-await-in-loop
                        for (doc of queryRes.docs) {
                            snapshoterLocation(doc,returnArr,lngFlipped,latLow,latHigh,lngLow,lngHigh)
                        }
                    } else {
                        const queryRes = await baseQuery.get() // eslint-disable-line no-await-in-loop
                        for (doc of queryRes.docs) {
                            snapshoterLocation(doc,returnArr,latLow,latHigh,lngLow,lngHigh)
                        }
                    }
                }
                writeLog(req,200)
                res.status(200).json(returnArr)
                return
            }
          });
          return
    } else {
        if (keyTermsSent) {
            baseQuery.where('keywords','array-contains-any',keyTermsTrimmed)
            .get().then(snapshot => {
                snapshot.forEach(doc => snapshoter(doc,returnArr));
                writeLog(req,200)
                res.status(200).json(returnArr)
                return
            })
            .catch(err => {
                if (err) res.status(500).send("Internal Server Error")
            });
        } else {
            baseQuery.get().then(snapshot => {
                snapshot.forEach(doc => snapshoter(doc,returnArr));
                writeLog(req,200)
                res.status(200).json(returnArr)
                return
            })
            .catch(err => {
                if (err) res.status(500).send("Internal Server Error")
            });
        }
    }
}


function articleFilter(doc, returnArr) {
    if(!returnArr.some((x,i) => {
        if (x.day<doc.data().date_of_publication.toDate()) return false
        returnArr[i-1].articles = returnArr[i-1].articles + 1
        return true
    })) {
        returnArr[returnArr.length-1].articles = returnArr[returnArr.length-1].articles + 1
    }
}

function articleFilterLocation(doc,returnArr,lngFlipped,latLow,latHigh,lngLow,lngHigh) {
    if (lngFlipped) {
        // To account for when longitude wraps around
        if (doc.data().location.latitude > latLow && doc.data().location.latitude < latHigh &&
         ((doc.data().location.longitude > lngLow && doc.data().location.longitude < 180) || (doc.data().location.longitude < lngHigh && doc.data().location.longitude > -180))) {
            articleFilter(doc,returnArr)
        }
    } else {
        if (doc.data().location.latitude > latLow && doc.data().location.latitude < latHigh && doc.data().location.longitude > lngLow && doc.data().location.longitude < lngHigh) {
            articleFilter(doc,returnArr)
        }
    }

}

function casesFilter(doc, returnArr) {
    if(!returnArr.some((x,i) => {
        if (x.day<doc.data().date_of_publication.toDate()) return false
        returnArr[i-1].articles = returnArr[i-1].articles + doc.data().cases
        return true
    })) {
        returnArr[returnArr.length-1].articles = returnArr[returnArr.length-1].articles + doc.data().cases
    }
}

function casesFilterLocation(doc,returnArr,lngFlipped,latLow,latHigh,lngLow,lngHigh) {
    if (lngFlipped) {
        // To account for when longitude wraps around
        if (doc.data().location.latitude > latLow && doc.data().location.latitude < latHigh &&
         ((doc.data().location.longitude > lngLow && doc.data().location.longitude < 180) || (doc.data().location.longitude < lngHigh && doc.data().location.longitude > -180))) {
            articleFilter(doc,returnArr)
        }
    } else {
        if (doc.data().location.latitude > latLow && doc.data().location.latitude < latHigh && doc.data().location.longitude > lngLow && doc.data().location.longitude < lngHigh) {
            casesFilter(doc,returnArr)
        }
    }

}

// Every day emailer
exports.scheduledEmailDaily = functions.pubsub.schedule('0 8 * * *').timeZone('Australia/Sydney').onRun((context) => {
    emailIterator("Daily")
})

// Weekly Emailer
exports.scheduledEmailWeekly = functions.pubsub.schedule('0 8 * * 1').timeZone('Australia/Sydney').onRun((context) => {
    emailIterator("Weekly")
})


// Takes an array of report objects and sends an email.
function sendEmail(articleList, email) {
    const today = new Date()
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    console.log(today.toLocaleString('en-AU', options));
    const dateString = today.toLocaleString('en-AU', options)

    const url = 'https://cors-anywhere.herokuapp.com/https://api.sendgrid.com/v3/mail/send'
    const msg = {
      "personalizations": [
        {
          "to": [
            {
              "email": email
            }
          ],
          "subject": "Disease summary for " + dateString
        }
      ],
      "from": {
        "email": "hi4notifications@gmail.com"
      },
      "content": [
        {
          "type": "text/html",
          "value": emailTemplate(dateString,articleList.slice(0,3))
        }
      ]
    };

    const myheaders = {
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer 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',
        'Access-Control-Allow-Credentials': "*",
        'Origin': "any"
      }
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(msg),
      headers: myheaders,
    })
    // .then(res => res)
    // .then(response => console.log('Success:', response))
    .catch(error => console.error('Error:', error));  
}

async function emailIterator(emailPref) {
    
    const initDate = new Date()
    initDate.setDate(new Date().getDate()-21)
    const nowDate = new Date()
    startTime = new admin.firestore.Timestamp(parseInt(initDate.getTime()/1000),0)
    endTime = new admin.firestore.Timestamp(parseInt(nowDate.getTime()/1000),0)
    const queryRes = await firestoreDB.collection('userData').get() // eslint-disable-line no-await-in-loop
    for (doc of queryRes.docs) {
        const emailAddress = doc.data().emailAddress
        const pref = doc.data().emailPref
        const key_terms = doc.data().key_terms
        const location = doc.data().location
        const sendQuantity = doc.data().sendQuantity
        let articlesCollected = 0
        let articlesToSend = []
        if (emailAddress !== undefined && pref !== undefined && key_terms !== undefined && location !== undefined && sendQuantity!==undefined && location.length>0 && pref === emailPref && Array.isArray(key_terms) && Array.isArray(location)) {
            let resultsArr = new Array(location.length)
            let articlePromises = new Array(location.length)
            location.forEach((locationVal,i) => {
                console.log(i)
                articlePromises[i] =  articleExtractor(startTime, endTime, key_terms, locationVal)
                    .then(results=>{
                        resultsArr[i] = results
                        return results
                    })
                    .catch(err => console.log(err))
            })
            Promise.all(articlePromises)
            .then(x=>{
                var i = 0
                while ((articlesCollected < sendQuantity) && resultsArr.some(y=>y.length>0)) {
                    if (i>resultsArr.length-1) {
                        i=0
                    }
                    let resultsArr2 = resultsArr[i]
                    // console.log(resultsArr2.length)
                    const article = resultsArr2.shift()
                    // console.log(resultsArr2.length)
                    resultsArr[i] = resultsArr2
                    if (article!==undefined) {
                        articlesToSend.push(article)
                        articlesCollected = articlesCollected + 1
                    }
                    i = i + 1
                }
                sendEmail(articlesToSend,emailAddress)
                return x
            })
            .catch(x=>console.log(x))
        }

    }


    return
}


// Test endpoint
app.get('/sendEmail',(req, res) => {
    emailIterator("Daily")
    return res.status(200).send("Sent")
})



// Run to update database
exports.scheduledFunction = functions.pubsub.schedule('every 12 hours').onRun((context) => {
    var JHData
    var popData
    var lastDateOuter
    const fetches = [
        fetch(`https://datahub.io/core/covid-19/r/time-series-19-covid-combined.json`)
        .then(data=>data.json())
        .then(data => {
        // Assume the last entry will have the most recent date
        const lastDate = data[data.length-1].Date
        lastDateOuter=lastDate
        const dateObj = new Date(lastDate)
        let dataToday = data.filter(x=>x.Date===lastDate)
        dataToday.forEach(x=>x.Country =  x['Country/Region'])

        const countriesNamesCoalesced = dataToday.filter(x=>x['Province/State']!==null).map(x=>x.Country).filter((value,i,self) => self.indexOf(value)===i)

        const countryCoalescedData = countriesNamesCoalesced.map(x=> {
            const countryObjs = dataToday.filter(y=>y.Country===x)
            let accumulatedObj = countryObjs.reduce((prev, curr) => {
                return {Confirmed:prev.Confirmed + curr.Confirmed, Deaths: prev.Deaths + curr.Deaths, Recovered: prev.Recovered + curr.Recovered}
            }, {Confirmed:0, Deaths: 0, Recovered: 0})

            accumulatedObj.Country = x
            accumulatedObj['Province/State'] = x
            return accumulatedObj
        })
        dataToday = dataToday.concat(countryCoalescedData)
        JHData = dataToday
        // firestoreDB.collection('COVIDInfectionData').add(storeObj)   
        return
        })
        .catch((er)=>{
            return
        }),
        fetch(`https://datahub.io/core/population/r/population.json`)
        .then(data=>data.json())
        .then(data=>{
            const lastDate = data.find((x,i,arr)=>arr.every(y=>x.Year>=y.Year))
            const lastYear = lastDate.Year
            const currYearData = data.filter(x=>x.Year===lastYear)
            const dataToWrite = currYearData.map(x=>{return {code:x['Country Code'], population:x.Value, name:x['Country Name']}})
            const storeObj= {year:lastYear,data:dataToWrite,writeTime: new Date()}
            popData = storeObj
            return data
        })
        .catch(x=>{
            console.log(x)
            return
        })
    ]
    Promise.all(fetches)
    .then(x=>{
        // console.log(JHData)
        const mappedData = JHData.map(x=>{
            if (x['Province/State']==="Greenland") {
                var ret = x
                var popObj = popData.data.find(x=>x.name==="Greenland")
                if (popObj!==undefined) {
                    ret['pop'] = popObj.population
                }
                return ret
            }
            // console.log(x)
            if (x['Province/State']===x.Country || x['Province/State']===null) {
                var obj = CountryCodes2.find(y=>y.name===x.Country)
                if (obj===undefined) {
                    return x
                } else {
                    var ret2 = x
                    var popObj2 = popData.data.find(x=>x.code===obj.iso3)
                    if (popObj2!==undefined) {
                        ret2['pop'] = popObj2.population
                    }
                    return ret2
                }
            }
            else
            {
                return x
            }
        }).filter(x=>x!==undefined)
        const storeObj= {date:lastDateOuter,data:mappedData,writeTime: new Date()}
        firestoreDB.collection('COVIDInfectionData').add(storeObj) 
        return x
    })
    .catch(x=>{
        console.log(x)
        return x
    })
    return 
  });

app.get('/setCOVIDData',(req,res)=>{
    var JHData
    var popData
    var lastDateOuter
    const fetches = [
        fetch(`https://datahub.io/core/covid-19/r/time-series-19-covid-combined.json`)
        .then(data=>data.json())
        .then(data => {
        // Assume the last entry will have the most recent date
        const lastDate = data[data.length-1].Date
        lastDateOuter=lastDate
        const dateObj = new Date(lastDate)
        let dataToday = data.filter(x=>x.Date===lastDate)
        dataToday.forEach(x=>x.Country =  x['Country/Region'])

        const countriesNamesCoalesced = dataToday.filter(x=>x['Province/State']!==null).map(x=>x.Country).filter((value,i,self) => self.indexOf(value)===i)

        const countryCoalescedData = countriesNamesCoalesced.map(x=> {
            const countryObjs = dataToday.filter(y=>y.Country===x)
            let accumulatedObj = countryObjs.reduce((prev, curr) => {
                return {Confirmed:prev.Confirmed + curr.Confirmed, Deaths: prev.Deaths + curr.Deaths, Recovered: prev.Recovered + curr.Recovered}
            }, {Confirmed:0, Deaths: 0, Recovered: 0})

            accumulatedObj.Country = x
            accumulatedObj['Province/State'] = x
            return accumulatedObj
        })
        dataToday = dataToday.concat(countryCoalescedData)
        JHData = dataToday
        // firestoreDB.collection('COVIDInfectionData').add(storeObj)   
        return
        })
        .catch((er)=>{
            return
        }),
        fetch(`https://datahub.io/core/population/r/population.json`)
        .then(data=>data.json())
        .then(data=>{
            const lastDate = data.find((x,i,arr)=>arr.every(y=>x.Year>=y.Year))
            const lastYear = lastDate.Year
            const currYearData = data.filter(x=>x.Year===lastYear)
            const dataToWrite = currYearData.map(x=>{return {code:x['Country Code'], population:x.Value, name:x['Country Name']}})
            const storeObj= {year:lastYear,data:dataToWrite,writeTime: new Date()}
            popData = storeObj
            return data
        })
    ]
    Promise.all(fetches)
    .then(a=>{
        // console.log(JHData)
        const mappedData = JHData.map(x=>{
            if (x['Province/State']==="Greenland") {
                var ret = x
                var popObj = popData.data.find(x=>x.name==="Greenland")
                if (popObj!==undefined) {
                    ret['pop'] = popObj.population
                }
                return ret
            }
            // console.log(x)
            if (x['Province/State']===x.Country || x['Province/State']===null) {
                var obj = CountryCodes2.find(y=>y.name===x.Country)
                if (obj===undefined) {
                    return x
                } else {
                    var ret3 = x
                    var popObj3 = popData.data.find(x=>x.code===obj.iso3)
                    if (popObj3!==undefined) {
                        ret3['pop'] = popObj3.population
                    }
                    return ret3
                }
            }
            else
            {
                return x
            }
        }).filter(x=>x!==undefined)
        const storeObj= {date:lastDateOuter,data:mappedData,writeTime: new Date()}
        firestoreDB.collection('COVIDInfectionData').add(storeObj) 
        .then(x=>res.status(200).send("Done")) 
        .catch(x=>{
            console.log(x)
            return x
        })
        return a
    })
    .catch(x=>{
        console.log(x)
        return x
    })
    return 
    
})

function popDataUpdater() {
    fetch(`https://datahub.io/core/population/r/population.json`)
    .then(data=>data.json())
    .then(data=>{
        const lastDate = data.find((x,i,arr)=>arr.every(y=>x.Year>=y.Year))
        const lastYear = lastDate.Year
        const currYearData = data.filter(x=>x.Year===lastYear)
        const dataToWrite = currYearData.map(x=>{return {code:x['Country Code'], population:x.Value, name:x['Country Name']}})
        const storeObj= {year:lastYear,data:dataToWrite,writeTime: new Date()}
        firestoreDB.collection('PopData').add(storeObj)   
        return data
    })
    .catch(x=>{
        console.log(x)
        return x
    })
}
// popDataUpdater()



app.get('/COVIDCaseData', (req, res) => {
    firestoreDB.collection('COVIDInfectionData').orderBy('date','desc').limit(1)
     .get().then(snapshot => {
         snapshot.forEach(doc => {
             res.status(200).json(doc.data().data)
         });
         writeLog(req,200)
         return
     })
     .catch(err => {
         if (err) res.status(500).send("Internal Server Error")
     });
     return
 })

// function snapshotEmailExecutorLocation(doc,returnArr,lngFlipped,latLow,latHigh,lngLow,lngHigh) {
//     if (lngFlipped) {
//         // To account for when longitude wraps around
//         if (doc.data().location.latitude > latLow && doc.data().location.latitude < latHigh &&
//          ((doc.data().location.longitude > lngLow && doc.data().location.longitude < 180) || (doc.data().location.longitude < lngHigh && doc.data().location.longitude > -180))) {
//             snapshotEmailExecutor(doc,returnArr)
//         }
//     } else {
//         if (doc.data().location.latitude > latLow && doc.data().location.latitude < latHigh && doc.data().location.longitude > lngLow && doc.data().location.longitude < lngHigh) {
//             snapshotEmailExecutor(doc,returnArr)
//         }
//     }

// }


// function snapshotEmailExecutor(doc, returnArr) {
//     returnObj = {}
//     returnObj.url = doc.data().url
//     returnObj.date_of_publication = doc.data().date_string
//     returnObj.headline = doc.data().headline
//     returnObj.main_text = doc.data().full_text
//     returnObj.reports = doc.data().reports
//     returnObj.cases = doc.data().cases
//     returnArr.push(returnObj)
// }

// StartTime+EndTime must be Firebase Timestamp objects
// location and keyTerms may be empty string, in which case they will be ignored
function articleExtractor(startTime, endTime, keyTerms, location) {
    let returnArr = []
    const ref = firestoreDB.collection('articles')
    const baseQuery = ref.where('date_of_publication',">",startTime)
    .where('date_of_publication',"<",endTime)
    .orderBy('date_of_publication','desc')

    // Location filtering
    return new Promise(function(resolve, reject) {
    if (location!=="") {
        googleMapsClient.geocode({
            address: location
          }, async (err, response) => {
            if (!err) {
                if (response.json.results.length ===0) reject(new Error("Error: Unable to find the referenced location. Please check spelling and try again"))
                for (const locationOBJ of response.json.results) {
                    let latLow = locationOBJ.geometry.bounds.southwest.lat
                    let latHigh = locationOBJ.geometry.bounds.northeast.lat
                    let lngLow = locationOBJ.geometry.bounds.southwest.lng
                    let lngHigh = locationOBJ.geometry.bounds.northeast.lng

                    let lngFlipped = (lngLow > lngHigh)

                    // Check if the bound box is too small, in which case draw a bigger box.
                    if (!lngFlipped) {
                        if ((latHigh - latLow)*(lngHigh-lngLow) < 4) {
                            latLow = locationOBJ.geometry.location.lat - 1
                            latHigh = locationOBJ.geometry.location.lat + 1
                            lngLow = locationOBJ.geometry.location.lng - 1
                            lngHigh = locationOBJ.geometry.location.lng + 1
                        }
                    }

                    if (keyTerms!=="") {
                        const queryRes = await baseQuery.where('keywords','array-contains-any',keyTerms).get() // eslint-disable-line no-await-in-loop
                        for (doc of queryRes.docs) {
                            snapshotExecutorLocation(doc,returnArr,lngFlipped,latLow,latHigh,lngLow,lngHigh)
                        }
                    } else {
                        const queryRes = await baseQuery.get() // eslint-disable-line no-await-in-loop
                        for (doc of queryRes.docs) {
                            snapshotExecutorLocation(doc,returnArr,lngFlipped,latLow,latHigh,lngLow,lngHigh)
                        }
                    }
                }
                resolve(returnArr)
                return
            }
          });
          return
    } else {
        if (keyTerms!=="") {
            baseQuery.where('keywords','array-contains-any',keyTerms)
            .get().then(snapshot => {
                snapshot.forEach(doc => snapshotExecutor(doc,returnArr));
                resolve(returnArr)
                return
            })
            .catch(err => {
                reject(err)
                return
            });
        } else {
            baseQuery.get().then(snapshot => {
                snapshot.forEach(doc => snapshotExecutor(doc,returnArr));
                resolve(returnArr)
                return
            })
            .catch(err => {
                reject(err)
                return
            });
        }
    }
    })
}


app.get('/reports',(req, res) => {
    const requiredkeys = ['start_date','end_date']
    const allowedKeys = ['start_date','end_date','key_terms','location','page','num']
    let keys = Object.keys(req.query)
    let keysLower = keys.map(x=>x.toLowerCase())
    const missingKeys = requiredkeys.filter(x=>!keysLower.includes(x))
    const extraKeys = keysLower.filter(x=>!allowedKeys.includes(x))

    if ( missingKeys.length > 0 && extraKeys.length === 0 ) {
        writeLog(req,400)
        return res.status(400).send('Missing following keys: ' + missingKeys.join(", "));
    }
    if ( missingKeys.length === 0 && extraKeys.length > 0 ) {
        writeLog(req,400)
        return res.status(400).send('Extra keys: ' + extraKeys.join(", "));
    }
    if ( missingKeys.length > 0 && extraKeys.length > 0 ) {
        writeLog(req,400)
        return res.status(400).send('Missing following keys: ' + missingKeys.join(", ") + ". And found extra keys: " + extraKeys.join(", "));
    }

    let keyTermsSent = false
    if (keysLower.includes('key_terms')) keyTermsSent=true
    let locationSent = false
    if (keysLower.includes('location')) locationSent=true
    let pageSent = false
    if (keysLower.includes('page')) pageSent=true
    let numSent = false
    if (keysLower.includes('num')) numSent=true

    // Accomodate various casing of input parameter
    const startDateString = req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'start_date')]
    const endDateString = req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'end_date')]
    const keyTermString = (keyTermsSent ? req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'key_terms')] : "")
    const locationString = (locationSent ? req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'location')] : "")
    const pageString = (pageSent ? req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'page')] : "")
    const numString = (numSent ? req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'num')] : "")


    let startTime = stringToTimeStamp(startDateString)
    let endTime = stringToTimeStamp(endDateString)
    if(startTime===null) {
        writeLog(req,400)
        return res.status(400).send('Invalid Start Time. Format: YYYY-MM-DDTHH:MM:SS')
    }
    if(endTime===null) {
        writeLog(req,400)
        return res.status(400).send('Invalid End Time. Format: YYYY-MM-DDTHH:MM:SS')
    }
    if (startTime.toMillis() > endTime.toMillis()) {
        writeLog(req,400)
        return res.status(400).send('Invalid Time String. End Date is earlier than start date.')
    }

    let keyTermsTrimmed=""
    if (keyTermsSent) {
        let keyTermMatch = keyTermString.match("^((?:[^,]+,)*)([^,]+)$")
        if (keyTermMatch===null) {
            writeLog(req,400)
            return res.status(400).send('Invalid key_terms string. Please provide a comma seperated list of terms to filter by') 
        }

        let keyTerms = keyTermMatch[1].split(",").filter(x => x!=="")
        keyTerms.push(keyTermMatch[2])
        keyTermsTrimmed = keyTerms.map(x=>x.trim().toLowerCase())  
    }

    let page = 1
    if (pageSent) {
        page = parseInt(pageString, 10)
        if(isNaN(page)) {
            writeLog(req,400)
            return res.status(400).send('Error: "page" must be an integer')             
        }
        if (page<1) {
            writeLog(req,400)
            return res.status(400).send('Error: "page" must be an integer 1 or greater')     
        }
    }


    let num = 10
    if (numSent) {
        num = parseInt(numString, 10)
        if(isNaN(num)) {
            writeLog(req,400)
            return res.status(400).send('Error: "num" must be an integer')             
        }
        if (num<1) {
            writeLog(req,400)
            return res.status(400).send('Error: "num" must be an integer 1 or greater')     
        }
    }

    articleExtractor(startTime,endTime,keyTermsTrimmed,locationString)
    .then(results=>{
        res.status(200).json(arraySlice(results, page, num))
        return results
    })
    .catch(err=>console.log(err))
    return
});


app.get('/logs', (req, res) => {
    let returnArr = []


    let keys = Object.keys(req.query)
    let ref = firestoreDB.collection('logging')

    let num = 5
    if (keys.includes('num')) {
        num = parseInt(req.query.num)
    }

    
    ref.orderBy('accessTime','desc').limit(num).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        returnArr.push(doc.data())
      });
      res.status(200).send(JSON.stringify(returnArr))
      return returnArr
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
})


function stringToTimeStamp(string) {
    let match = string.match("([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])T([0-9][0-9]):([0-9][0-9]):([0-9][0-9])")
    if (match===null) return null
    let year = match[1]
    let month = parseInt(match[2])-1
    let day = match[3]
    let hour = match[4]
    let minutes = match[5]
    let seconds = match[6]

    let DateOBJ = new Date(Date.UTC(year,month,day,hour,minutes,seconds))
    let timestampOBJ = new admin.firestore.Timestamp(parseInt(DateOBJ.getTime()/1000),0)
    return timestampOBJ
}

function stringToDayTimeStamp(string) {
    let match = string.match("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$")
    if (match===null) return null
    let year = match[1]
    let month = parseInt(match[2])-1
    let day = match[3]

    let DateOBJ = new Date(Date.UTC(year,month,day,0,0,0))
    let timestampOBJ = new admin.firestore.Timestamp(parseInt(DateOBJ.getTime()/1000),0)
    return timestampOBJ
}


app.post('/post-text', (req,res) => {
    let expectedKeys = ['url','date_of_publication','headline','main_text','reports']
    // TODO Should make case_insensitive
    if(JSON.stringify(Object.keys(req.body).sort())!==JSON.stringify(expectedKeys.sort())) {
        writeLog(req,400)
        return res.status(400).send("Malformed JSON. Expected following keys " + expectedKeys.join())
    }

    firestoreDB.collection('articles').add(req.body)
    writeLog(req,200)
    return res.status(200).send("Entry Stored");
})


function writeLog(req ,reponseStatus) {
    var logContents = {}
    var dateNow = new Date()
    logContents.teamName = "Hi-4"
    logContents.dataSource = "Global Incident Map"
    logContents.accessTime = new admin.firestore.Timestamp(parseInt(dateNow.getTime()/1000),0)
    logContents.reponseStatus = reponseStatus
    logContents.method = req.method
    logContents.endpoint = req.url
    logContents.query = req.query

    firestoreDB.collection('logging').add(logContents)
} 

exports.app = functions.https.onRequest(app);

function snapshotExecutor(doc, returnArr) {
    returnObj = {}
    returnObj.url = doc.data().url
    returnObj.date_of_publication = doc.data().date_string
    returnObj.headline = doc.data().headline
    returnObj.main_text = doc.data().full_text
    returnObj.reports = doc.data().reports
    returnObj.cases = doc.data().cases
    returnArr.push(returnObj)
}

function snapshotExecutorLocation(doc,returnArr,lngFlipped,latLow,latHigh,lngLow,lngHigh) {
    if (lngFlipped) {
        // To account for when longitude wraps around
        if (doc.data().location.latitude > latLow && doc.data().location.latitude < latHigh &&
         ((doc.data().location.longitude > lngLow && doc.data().location.longitude < 180) || (doc.data().location.longitude < lngHigh && doc.data().location.longitude > -180))) {
            snapshotExecutor(doc,returnArr)
        }
    } else {
        if (doc.data().location.latitude > latLow && doc.data().location.latitude < latHigh && doc.data().location.longitude > lngLow && doc.data().location.longitude < lngHigh) {
            snapshotExecutor(doc,returnArr)
        }
    }

}


function arraySlice(returnArr, page, num) {
    const pageNo = page-1
    const start = pageNo*num
    const end = start + num

    return returnArr.slice(start,end)
}
