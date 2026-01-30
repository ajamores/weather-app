
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

let presentCountry = "";
let presentWeather = "";

// Day 1
const d1 = document.getElementById("d1");
// Day 2
const d2 = document.getElementById("d2");
// Day 3
const d3 = document.getElementById("d3");
// Day 4
const d4 = document.getElementById("d4");
// Day 5
const d5 = document.getElementById("d5");




//When document begins 
document.addEventListener('DOMContentLoaded', async () => {

    await getDataFlow('Hamilton, ON');

});

form.addEventListener("submit", async (e) => {
        console.log("FORM SUBMITTED");
        e.preventDefault(); //ensure function runs, no spam 
        console.log(e);

        const formData = new FormData(form);

        const location = formData.get('location');

        await getDataFlow(location);

        //remove search result
        form.reset();
    });






const getDataFlow = async (location) =>{

    if(location != null && location.trim() !== ''){

    try{
        const coords = await getLocation(location);

        if(coords){

            //set country and locaility and city 
            extractLocationInfo(coords);
            // 1️⃣ Get weather
            const weatherInfo = await getTodaysWeather(coords.lat, coords.long);
            extractWeatherInfo(weatherInfo);
            
            console.log("Present Country" + presentCountry);
            const location = presentCountry;
            await fetchImage(location, weatherInfo.description);
            

            // 3️⃣ Get 5-day forecast
            const forecast = await get5DayForecast(coords.lat, coords.long);
            extractDailyForecast(forecast);

            // 4️⃣ Fetch image and news AFTER weather is available
            await fetchNews(presentCountry);

        
        }
    } catch(error){
        console.log(error);
    }

}

};


/*
=======================Functions=================================
*/

const getLocation = async (address) =>{
    try{
        console.log("Address: " + address)
        const response = await fetch(`/api/geocoding?address=${address}`);
        
        if(!response.ok){
            throw new Error(`HTTP error: ${response.status}`);
        }
        const serverResponse = await response.json();

        if (!serverResponse) {
            throw new Error("Error: Check Server logs from geocoding API");
        }

        console.log(`Location info, Server Response: ${JSON.stringify(serverResponse)}`);
        return serverResponse;



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
        const response = await fetch(`/api/weather-forecast?lat=${lat}&long=${long}`);

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



const extractLocationInfo = async (data) => {

    let country = document.getElementById("country");
    let locCity = document.getElementById("loc-city");

    country.innerText = data.country;

    if(data.locality === "" || data.locality == null){
        locCity.innerText = data.city;
        presentCountry = data.city;
    } else{
        locCity.innerText = `${data.locality}, ${data.city}`;
        presentCountry = `${data.locality}, ${data.city}`;
    }

    presentCountry += `, ${data.country}`;
    
};

const extractWeatherInfo = (data) =>{

    temp.innerHTML = `${data.temp}&deg;C`;
    timeStamp.innerText = data.timeStamp
    weatherIcon.src = `/api/weather-icon?url=${encodeURIComponent(data.urlIcon)}`;
    weatherIcon.alt = data.description;
    description.innerText = data.description;

    presentWeather = data.description;

};

const extractDailyForecast = (data) => {
    if (!data.success || !data.forecast || data.forecast.length === 0) return;

    const dayDivs = [d1, d2, d3, d4, d5];

    data.forecast.forEach((dayData, index) => {
        const div = dayDivs[index];
        if (!div) return;

        // Clear existing content
        div.innerHTML = "";

        // Create div for image + day
        const iconDayDiv = document.createElement("div");
        iconDayDiv.classList.add("icon-day");

        const img = document.createElement("img");
        img.src = `/api/weather-icon?url=${encodeURIComponent(dayData.iconUrl)}`;
        img.alt = dayData.description;
        img.classList.add("weather-icon");
        iconDayDiv.appendChild(img);

        const dayName = document.createElement("span");
        dayName.innerText = dayData.day;
        dayName.classList.add("day");
        iconDayDiv.appendChild(dayName);

        // Create separate div for "feels like"
        const feelsLikeDiv = document.createElement("div");
        feelsLikeDiv.classList.add("feels-like");

        // Create individual spans for high, low, and description
        const highSpan = document.createElement("span");
        highSpan.classList.add("high");
        highSpan.innerText = `High: ${dayData.high}°C`;

        const lowSpan = document.createElement("span");
        lowSpan.classList.add("low");
        lowSpan.innerText = `Low: ${dayData.low}°C`;

        const descSpan = document.createElement("span");
        descSpan.classList.add("desc");
        descSpan.innerText = dayData.description;

        // Append spans to feelsLikeDiv
        feelsLikeDiv.appendChild(highSpan);
        feelsLikeDiv.appendChild(lowSpan);
        feelsLikeDiv.appendChild(descSpan);

        // Append both to the main div
        div.appendChild(iconDayDiv);
        div.appendChild(feelsLikeDiv);
    });
};

const fetchNews = async (location) => {
    const newsList = document.getElementById("news-section");
    newsList.innerHTML = "<li>Gemeni API fetching facts...</li>"; // show loading state

    try {
        const response = await fetch(`/api/news?location=${encodeURIComponent(location)}`);
        const data = await response.json();


        // parse the AI response
        let articles = [];
        try {
            articles = data.articles;
            console.log(articles);
        } catch (err) {
            console.error("Failed to parse AI news JSON:", err);
            newsList.innerHTML = "<li>Failed to load news.</li>";
            return;
        }

        // clear and populate
        newsList.innerHTML = "";
        if (articles && articles.length > 0) {
            articles.forEach(item => {
                const li = document.createElement("li");
                li.innerHTML = `<a href="${item.url}" target="_blank">${item.name}</a>`;
                newsList.appendChild(li);
            });
        } else {
            newsList.innerHTML = "<li>No news found for this location.</li>";
        }

    } catch (err) {
        console.error(err);
        newsList.innerHTML = "<li>Error fetching news.</li>";
    }
};

const setBackground = (imageUrl) => {
    const weatherApp = document.getElementById("weather-app")
    weatherApp.style.backgroundImage = `url('${imageUrl}')`;
};

const fetchImage = async (country, weather) => {
    try {
        //Remember encodeURI: "Hamilton, ON" → "Hamilton%2C%20ON" 
        const response = await fetch(`/api/image?country=${encodeURIComponent(country)}&weather=${encodeURIComponent(weather)}`);
        
        console.log(response);
        
        const data = await response.json();
        console.log("UNSPLASH IMAGE: " + data);

        if (data.success) {
            setBackground(data.imageUrl);
        } else {
            // fallback to default
            setBackground('/assets/images/rain.jpg');
        }
    } catch (err) {
        console.error("Failed to fetch image:", err);
        setBackground('/assets/images/rain.jpg'); // fallback
    }
};




