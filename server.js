require('dotenv').config();
const express = require('express');
const axios = require('axios'); //Use for http requests 

//start express 
const app = express()


//===============CONFIG=======================//

//set port to pull from env or default to 3000
const PORT = process.env.PORT || 3000; 

//Get api key
const apiKey = process.env.WEATHER_API;

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

        addressComp = geoLocationData.results[0].address_components;

        //Obtain city and Country by iterating through data 
        for(let i = 0; i < addressComp.length; i++){

            //get city
            if(addressComp[i].types.includes('locality') && addressComp[i].types.includes('political')){
                console.log(addressComp[i]);
                city = addressComp[i].long_name;
            }
            
            //If there is type locality then we will already have grabbed city, if not look here
            if(!city){
                
                if(addressComp[i].types.includes('administrative_area_level_1') && addressComp[i].types.includes('political')){
                    city = addressComp[i].long_name;
                }
            }

            //get country
            if(addressComp[i].types.includes('country') && addressComp[i].types.includes('political') ){
                console.log(addressComp[i]);
                country = addressComp[i].long_name;
            }
        }

        const location = geoLocationData.results[0].geometry.location;
        console.log(location)

        console.log(`Geolocation API - City: ${city}, Country: ${country}`);
        console.log(`Geolocation API - Lat: ${location.lat}, Long: ${location.lng} `);

        return res.json({
            success: true,
            city: city,
            country : country,
            lat: location.lat,
            long: location.lng
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

        //wait for response
        const apiResponse = await axios.get(url);

        //TO DO: add error check for api response

        res.json({
            success: true,
            data: apiResponse.data
        });

        console.log(res.data);

    } catch(error){

        console.log(`Weather API - HTTP resquest failed: ${error}`);
        console.log('Weather API - Error response:', error.response?.data); // ← API error details
        res.status(500).json({
            error: "Failed to fetch weather data",
            message: error.message
        });
    }
        
});








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


