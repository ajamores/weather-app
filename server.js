require('dotenv').config();
const express = require('express');
const axios = require('axios'); //Use for http requests 
const path = require('path');
const RadioBrowser = require('radio-browser')


//For possible ai intergration 
const { GoogleGenAI } = require("@google/genai");  // Use require() consistently
const fs = require('fs');  // Use require() consistently

//start express 
const app = express()


//===============CONFIG=======================//

//set port to pull from env or default to 3000
const PORT = process.env.PORT || 3000; 

//Get api key
const apiKey = process.env.WEATHER_API;
const googleAiApiKey = process.env.GEMINI_API;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS;

//get static files
app.use(express.json()); // Parse JSON bodies



//============ ROUTES=======================//

//This will serve out static files 
app.use(express.static('public'));


app.get("/api/geocoding", async (req, res) =>{

    try{
        const address = req.query.address;
        const formattedAddress = encodeURIComponent(address);

        console.log(`Searching Location for: ${formattedAddress}`);

        if(!address){
            return res.status(400).json({
                error: "Please provide valid location"
            });
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${apiKey}`;
        const apiResponse = await axios.get(url);

        console.log(apiResponse.data);

        const geoLocationData = apiResponse.data;

         // Check if geocoding was successful
        if(geoLocationData.status === "ZERO_RESULTS"){
            return res.status(404).json({
                success: false,
                status: geoLocationData.status,
                error: "Geocoding did not find any results"
            });
        } 


        let city ='';
        let country = ''
        let locality =''

        let addressComp = geoLocationData.results[0].address_components;
        console.log(addressComp);

        //Obtain city and Country by iterating through data 
        for(let i = 0; i < addressComp.length; i++){

            //get city
            if(addressComp[i].types.includes('locality') && addressComp[i].types.includes('political')){
                console.log(addressComp[i]);
                locality = addressComp[i].long_name;
            }
            
                
            if(addressComp[i].types.includes('administrative_area_level_1') && addressComp[i].types.includes('political')){
                console.log(addressComp[i]);
                city = addressComp[i].long_name;
            }
        

            //get country
            if(addressComp[i].types.includes('country') && addressComp[i].types.includes('political') ){
                console.log(addressComp[i]);
                country = addressComp[i].long_name;
            }
        }

        const location = geoLocationData.results[0].geometry.location;
        console.log(location)

        console.log(`Geolocation API - Locality: ${locality}, City: ${city}, Country: ${country}`);
        console.log(`Geolocation API - Lat: ${location.lat}, Long: ${location.lng} `);

        return res.json({
            success: true,
            city: city,
            country : country,
            locality: locality,
            lat: location.lat,
            long: location.lng,
            allData: geoLocationData
        });


    }catch(error){
        console.log(`Geolocation API - ${error}`);
        console.log(error.name);
        console.log(error.response);
        res.status(500).json({
            error: "Geolocation API - Failed to fetch geolocation data",
            message: error.message
        });
    }
});


//Get weather based on long and lat
app.get("/api/weather/", async (req,res) =>{
    try{
        
        const lat = req.query.lat;
        const long = req.query.long;

        console.log(`Weather API - Lat: ${lat}`);
        console.log(`Weather API - Long: ${long}`);

        //first check params
        if(!lat || !long){
            return res.status(400).json({
                error: "Lat and Long parameters must be provided"
            })
        }

        //form url with params
        const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${long}`;


        //TO DO: add error check for api response or not? cause the catch already
        //wait for response
        const apiResponse = await axios.get(url);


        console.log(apiResponse.data);

        //extract data
        const timeStamp = new Date(apiResponse.data.currentTime);
        const timeZone = apiResponse.data.timeZone.id;
        console.log("TimeStamp: " + timeStamp);
        console.log("TimeZone: " + timeZone);

        const formattedTimeStamp = timeStamp.toLocaleString('en-US', {
            timeZone: timeZone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        });

        console.log("Formatted timeZone: " + formattedTimeStamp);

        const urlIcon = apiResponse.data.weatherCondition.iconBaseUri;
        const description = apiResponse.data.weatherCondition.description.text;
        const temp = apiResponse.data.temperature.degrees;

        return res.json({
            success: true,
            timeStamp: formattedTimeStamp,
            timeZone: timeZone,
            urlIcon: urlIcon,
            description: description,
            temp: temp

        });
    

        

    } catch(error){

        console.log(`Weather API - HTTP resquest failed: ${error}`);
        console.log('Weather API - Error response:', error.response?.data); // ← API error details
        res.status(400).json({
            error: error,
            message: error.message,
        });
    }
        
});

//Http request to get svg weather icon 
app.get("/api/weather-icon", async (req, res) => {
  try {
    let url = req.query.url;


    if (!url) {
      return res.status(400).json({
        error: "Missing url parameter"
      });
    }

        // Append .svg if not already present
    if (!url.endsWith(".svg")) {
      url += ".svg";
    }

     console.log("Http request with url: " + url);

    const response = await axios.get(`${url}`, {
      responseType: "text",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    console.log("SVG length:", response.data.length);

    res.set("Content-Type", "image/svg+xml");
    res.send(response.data);

  } catch (error) {
    console.error("Weather icon error:", error.message);
    res.status(500).json({
      error: "Failed to fetch weather icon"
    });
  }
});

app.get("/api/weather-forecast", async (req, res) => {
    try {

        //Always show 6 days, first day is current day no need 
        const days = 10;
        const lat = req.query.lat;
        const long = req.query.long;

         console.log(`Weather API - Lat: ${lat}`);
        console.log(`Weather API - Long: ${long}`);

        //first check params
        if(!lat || !long){
            return res.status(400).json({
                error: "Lat and Long parameters must be provided"
            })
        }

        const url = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${long}&days=${days}`;

        const response = await axios.get(url);

        // console.log(JSON.stringify(response.data, null , 2));

        const forecastDays = response.data.forecastDays;
        console.log("Days of forcast grabbed: " + forecastDays.length);
        

        // Skip today → take next 5 days
        const nextFiveDays = forecastDays.map( day=> {
            console.log(day.displayDate);
            // parse the start date of the interval
            const date = new Date(day.interval.startTime);

            // get day of week, like Monday, Tuesday
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

            return {
                day: dayName,
                high: day.maxTemperature.degrees,
                low: day.minTemperature.degrees,
                description: day.daytimeForecast.weatherCondition.description.text,
                iconUrl: day.daytimeForecast.weatherCondition.iconBaseUri
            };
        });

        res.json({
            success: true,
            forecast: nextFiveDays
        });


        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/api/news", async (req, res) => {
    try {
        const location = req.query.location;
        if (!location || location.trim() === "") {
            return res.status(400).json({ error: "Location is required" });
        }

        // Initialize Gemini AI
        const ai = new GoogleGenAI({ apiKey: googleAiApiKey });
        const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
         generationConfig: {
            temperature: 1.7,   //  more randomness
            topP: 0.9
        },
        contents: `Give me 5 random fun facts about ${location}. Mix the facts up. Place the fact you have given in the url where it says fact and the actual fact in the name as well. 
            Return your response as **valid JSON only** in the following format:

            {
                "articles": [
                    { "name": "Title 1", "url": https://www.google.com/search?q=fact },
                    { "name": "Title 2" , "url": https://www.google.com/search?q=fact},
                    { "name": "Title 3", "url": https://www.google.com/search?q=fact },
                    { "name": "Title 4", "url": https://www.google.com/search?q=fact },
                    { "name": "Title 5", "url": https://www.google.com/search?q=fact }
                ]
            }`,
        });
        console.log(response.text);

        // Parse the AI response
        const titles = JSON.parse(response.text).articles;

        // Build Google News URLs automatically
        const articles = titles.map(a => ({
            name: a.name,
            url: a.url
        }));
        return res.json({ success: true, articles});

    } catch (error) {
        console.error("News API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// ================= Unsplash API ===================
const DEFAULT_IMAGE = 'assets/images/rain.jpg'; // place your default in public/images/

app.get("/api/image", async (req, res) => {
    try {
        const country = req.query.country || "world";
        const weather = req.query.weather || "clear";
        console.log("Getting image for: " + country);

        // URL-encode the query string
        const query = encodeURIComponent(`${country}`);

        const url = `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_KEY}&query=${query}&orientation=landscape&content_filter=high`;
        console.log("unsplash url: " + url);

        const response = await axios.get(url);
        console.log("UNSPLASH API DATA RECIEVED: " + JSON.stringify(response.data));

        const imageUrl = `${response.data.urls.raw}&w=1920&h=1080&fit=crop&sig=${Date.now()}`;

            return res.json({
                success: true,
                imageUrl: imageUrl
            });

    } catch (error) {
        console.error("Unsplash API error:", error.message);
        console.log("Error cause: " + error.cause);
        console.log(error.stack);

        // Return default image
        return res.json({
            success: false,
            imageUrl: DEFAULT_IMAGE,
            credit: ""
        });
    }
});






        //possible ai art generation 
      





//Listen for port
app.listen(PORT, () => {
    console.log(`Site up at: http://localhost:${PORT}`)
    console.log(`Listening on port: ${PORT}`);
});




//Get current conditions
// app.get("/", (request, response) => {
//     const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=LATITUDE&location.longitude=LONGITUDE`;

//     try{
//         cons
//     }
// });


