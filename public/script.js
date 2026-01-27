
const form = document.getElementById("searchbar");
console.log(`Form found: ${form}`);
let weatherIcon = document.getElementById("todays-icon");
let temp = document.getElementById("temp");
let locationInfo = document.getElementById("location-info");
console.log(`location info grabbed: ${locationInfo}`)
let weatherStats = document.getElementById("weather-stats");
let timeStamp = document.getElementById("time-stamp")
let timeZone = document.getElementById("time-zone");
let description = document.getElementById("description");
console.log("Description element: " + description)

// Day 1
const d1 = document.getElementById("d1");
const d1Icon = document.getElementById("d1-icon");
const d1Name = document.getElementById("d1-name");

// Day 2
const d2 = document.getElementById("d2");
const d2Icon = document.getElementById("d2-icon");
const d2Name = document.getElementById("d2-name");

// Day 3
const d3 = document.getElementById("d3");
const d3Icon = document.getElementById("d3-icon");
const d3Name = document.getElementById("d3-name");

// Day 4
const d4 = document.getElementById("d4");
const d4Icon = document.getElementById("d4-icon");
const d4Name = document.getElementById("d4-name");

// Day 5
const d5 = document.getElementById("d5");
const d5Icon = document.getElementById("d5-icon");
const d5Name = document.getElementById("d5-name");



//When document begins 
document.addEventListener('DOMContentLoaded', async () => {

    //Start default here 
    const coords = await getLocation('Hamilton, ON');

    if (coords) { 
        // console.log(`coords: ${JSON.stringify(coords)}`);

        // console.log("Got starting coordinates")
        await getTodaysWeather(coords.lat, coords.long);

    }


});

form.addEventListener("submit", async (e) => {
        console.log("FORM SUBMITTED");
        e.preventDefault(); //ensure function runs, no spam 
        console.log(e);

        const formData = new FormData(form);

        const location = formData.get('location');

        if(location != null && location.trim() !== ''){

            try{
                const coords = await getLocation(location);

                if(coords){
                    await getTodaysWeather(coords.lat, coords.long);

                    
                }
            } catch(error){
                console.log(error);
            }

        }

        //remove search result
        form.reset();
    });






/*
=======================Functions=================================
*/





const getLocation = async (address) =>{
    try{
        const response = await fetch(`/api/geocoding?address=${address}`);
        
        if(!response.ok){
            throw new Error(`HTTP error: ${response.status}`);
        }
        const serverResponse = await response.json();

        if (!serverResponse) {
            throw new Error("Error: Check Server logs from geocoding API");
        }

        console.log(`Location info, Server Response: ${JSON.stringify(serverResponse)}`);


        //set country and locaility and city 
        extractLocationInfo(serverResponse);

        //get weather
        const weatherInfo = await getTodaysWeather(serverResponse.lat, serverResponse.long);
        console.log(`Weather info, server response: ${JSON.stringify(weatherInfo)}`);
        extractWeatherInfo(weatherInfo);

        const forcast = await get5DayForecast(serverResponse.lat, serverResponse.long);
        console.log(`Weather 5 day forecast: ` + JSON.stringify(forcast));


    } catch(error){
        console.log(error);
    }
}

const getTodaysWeather = async (lat, long) => {
    
    try{
        const response = await fetch(`/api/weather?lat=${lat}&long=${long}`);

        if(!response.ok){
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();

        console.log(data);

        return data;
        
    } catch(error){
        console.log(error);
    }

}

const get5DayForecast = async (lat, long) => {
        try{
        const response = await fetch(`/api/weather-forcast?lat=${lat}&long=${long}`);

        if(!response.ok){
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();

        console.log(data);

        return data;
        
    } catch(error){
        console.log(error);
    }
}



const extractLocationInfo = (data) => {

    let country = document.getElementById("country");
    let locCity = document.getElementById("loc-city");

    country.innerText = data.country;

    if(data.locality === "" || data.locality == null){
        locCity.innerText = data.city;
    } else{
        locCity.innerText = `${data.locality}, ${data.city}`;
    }
};

const extractWeatherInfo = (data) =>{

    temp.innerHTML = `${data.temp}&deg;C`;
    timeStamp.innerText = data.timeStamp
    weatherIcon.src = `/api/weather-icon?url=${encodeURIComponent(data.urlIcon)}`;
    weatherIcon.alt = data.description;
    description.innerText = data.description;

};

const extractDailyForecast = (data) =>{
    
}




