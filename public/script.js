
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

    await getDataFlow('Waterloo, ON');

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

            

            //  Get weather
            const weatherInfo = await getTodaysWeather(coords.lat, coords.long);

            if (!weatherInfo) {
                alert("Weather data isn't available for your location. Please try searching for a nearby city.");
                return;
            }else{
                 //set country and locaility and city 
                extractLocationInfo(coords);
                extractWeatherInfo(weatherInfo);
                
                console.log("Present Country" + presentCountry);
                const location = presentCountry;
                await fetchImage(location, weatherInfo.description);
                

                // 3️Get 5-day forecast
                const forecast = await get5DayForecast(coords.lat, coords.long);
                extractDailyForecast(forecast);

                // 4 Fetch image and news AFTER weather is available
                await fetchNews(presentCountry);
            }
           

        
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
        return null
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
    newsList.innerHTML = "<li>Gemini API fetching facts...</li>"; // show loading state

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


function showLocationWeatherError() {

    
    // Show alert to the user
    alert("Weather data isn't available for your location. Please try searching for a nearby city.");
}



// Get modal and elements
const modal = document.getElementById("myModal");
const modalText = document.getElementById("modal-text");
const span = document.querySelector(".close");

const btn1 = document.getElementById("more-info");
const btn2 = document.getElementById("hide-ui");

// Button 1 click
btn1.onclick = () => {

  modal.style.display = "block";
  modalText.textContent = `Welcome to my weather app, where it is actually more than just a weather app. I wanted to practice some JavaScript while working on this and thought I could add a little bit more than the weather. 
    
    I used 3 Google API's - the Geolocation and Weather API. The Weather API accepts x and y co-ordinates to find weather conditions for a specific locations. I wanted users to be able to type a location not numbers to find the weather of their desired destination. 

    With the Geolocation API it will determine the co-ordinates of the location you enter. The more specific the location you enter the better. You can enter an address and it will get the city and country details. 

    I also used Google Gemini API to fetch quick facts about the area you searched. I also used the UnSplash API to get a picture based on the location you search. 

    The art is my favorite part of the app. Hope you enjoy.
  `;
}

btn2.onclick = () => {
    const weatherInfo = document.getElementById("weather-info");
    const sidebar = document.getElementById("sidebar");
    const searchbar = document.getElementById("searchbar");
    const recentNews = document.getElementById("recent-news");
    const newsSection = document.getElementById("news-section");

    weatherInfo.classList.toggle("hidden-ui");
    sidebar.classList.toggle("no-bg");
    searchbar.classList.toggle("no-bg")
    recentNews.classList.toggle("no-bg")
    newsSection.classList.toggle("no-bg")

    btn2.textContent =
        weatherInfo.classList.contains("hidden-ui")
        ? "Show UI"
        : "Hide UI";
};

// Close button click
span.onclick = () => {
  modal.style.display = "none";
}

// Click outside the modal closes it
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}


