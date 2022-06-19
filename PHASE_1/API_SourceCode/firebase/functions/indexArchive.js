// Used for storing old code while refactoring, just in case



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

    let keyTermsTrimmed
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


    let returnArr = []
    const ref = firestoreDB.collection('articles')
    const baseQuery = ref.where('date_of_publication',">",startTime)
    .where('date_of_publication',"<",endTime)
    .orderBy('date_of_publication','desc')

    // Location filtering
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
                            snapshotExecutorLocation(doc,returnArr,lngFlipped,latLow,latHigh,lngLow,lngHigh)
                        }
                    } else {
                        const queryRes = await baseQuery.get() // eslint-disable-line no-await-in-loop
                        for (doc of queryRes.docs) {
                            snapshotExecutorLocation(doc,returnArr,latLow,latHigh,lngLow,lngHigh)
                        }
                    }
                }
                writeLog(req,200)
                res.status(200).json(arraySlice(returnArr, page, num))
                return
            }
          });
          return
    } else {
        
        if (keyTermsSent) {
            baseQuery.where('keywords','array-contains-any',keyTermsTrimmed)
            .get().then(snapshot => {
                snapshot.forEach(doc => snapshotExecutor(doc,returnArr));
                writeLog(req,200)
                res.status(200).json(arraySlice(returnArr, page, num))
                return
            })
            .catch(err => {
                if (err) res.status(500).send("Internal Server Error")
            });
        } else {
            baseQuery.get().then(snapshot => {
                snapshot.forEach(doc => snapshotExecutor(doc,returnArr));
                writeLog(req,200)
                res.status(200).json(arraySlice(returnArr, page, num))
                return
            })
            .catch(err => {
                if (err) res.status(500).send("Internal Server Error")
            });
        }
    }
    return
});





app.get('/sendEmail',(req, res) => {
    let keys = Object.keys(req.query)
    let keysLower = keys.map(x=>x.toLowerCase())

    const requiredkeys = ['email','location','key_terms']
    const missingKeys = requiredkeys.filter(x=>!keysLower.includes(x))
    const extraKeys = keysLower.filter(x=>!requiredkeys.includes(x))


    if ( missingKeys.length > 0 && extraKeys.length === 0 ) {
        return res.status(400).send('Missing following keys: ' + missingKeys.join(", "));
    }
    if ( missingKeys.length === 0 && extraKeys.length > 0 ) {
        return res.status(400).send('Extra keys: ' + extraKeys.join(", "));
    }
    if ( missingKeys.length > 0 && extraKeys.length > 0 ) {
        return res.status(400).send('Missing following keys: ' + missingKeys.join(", ") + ". And found extra keys: " + extraKeys.join(", "));
    }
    const emailString = req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'email')]
    const locationString = req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'location')]
    const keyTermString = req.query[Object.keys(req.query).find(x => x.toLowerCase() === 'key_terms')]


    let keyTermMatch = keyTermString.match("^((?:[^,]+,)*)([^,]+)$")
    if (keyTermMatch===null) {
        writeLog(req,400)
        return res.status(400).send('Invalid key_terms string. Please provide a comma seperated list of terms to filter by') 
    }

    let keyTerms = keyTermMatch[1].split(",").filter(x => x!=="")
    keyTerms.push(keyTermMatch[2])
    const keyTermsTrimmed = keyTerms.map(x=>x.trim().toLowerCase())  


    if (locationString.length === 0) return res.status(400).send('Invalid Location Format. Ensure a location is provided')

    const startDate = new Date()
    startDate.setDate(new Date().getDate()-5)
    console.log(typeof startDate)
    const ref = firestoreDB.collection('articles')
    const baseQuery = ref.where('date_of_publication',">",new admin.firestore.Timestamp(parseInt(startDate.getTime()/1000),0))
    .where('date_of_publication',"<",new admin.firestore.Timestamp(parseInt(new Date().getTime()/1000),0))
    .orderBy('date_of_publication','desc')

    googleMapsClient.geocode({
        address: locationString
      }, async (err, response) => {
        if (!err) {

            if (response.json.results.length ===0) {
                writeLog(req,400)
                res.status(400).send("Error: Unable to find the referenced location. Please check spelling and try again")
                return
            }
            resultsArr = []
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

                const queryRes = await baseQuery.where('keywords','array-contains-any',keyTermsTrimmed).get() // eslint-disable-line no-await-in-loop
                for (doc of queryRes.docs) {
                    snapshotEmailExecutorLocation(doc,resultsArr,lngFlipped,latLow,latHigh,lngLow,lngHigh)
                }
                
            }
            const today = new Date()
            var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            console.log(today.toLocaleString('en-AU', options));
            const dateString = today.toLocaleString('en-AU', options)


            console.log("arr",resultsArr)
            writeLog(req,200)
            const url = 'https://cors-anywhere.herokuapp.com/https://api.sendgrid.com/v3/mail/send'
            const msg = {
              "personalizations": [
                {
                  "to": [
                    {
                      "email": emailString
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
                  "value": emailTemplate(dateString,resultsArr.slice(0,3))
                }
              ]
            };

            const myheaders = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer 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',
                'Access-Control-Allow-Credentials': "*",
                'Origin': "any"
              }

            // fetch(url, {
            //   method: 'POST',
            //   body: JSON.stringify(msg),
            //   headers: myheaders,
            // })
            // .then(res => res.status)
            // .then(response => console.log('Success:', response))
            // .catch(error => console.error('Error:', error));   
            res.status(200).send("Sent")
            return
        }
      });
      return
})