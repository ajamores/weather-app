
const form = document.getElementById("searchbar");
console.log(`Form found: ${form}`);
let weatherIcon = document.getElementById("weather-icon");
let temp = document.getElementById("temp");
let locationInfo = document.getElementById("location-info");
let weatherStats = document.getElementById("weather-stats");





//When document begins 
document.addEventListener('DOMContentLoaded', async () => {

    //Start default here 
    const coords = await getLocation('Hamilton, ON');

    if (coords) { 
        // console.log(`coords: ${JSON.stringify(coords)}`);

        // console.log("Got starting coordinates")
        await getWeather(coords.lat, coords.long);
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
                    await getWeather(coords.lat, coords.long);
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

        console.log(serverResponse);

    } catch(error){
        console.log(error);
    }
}

const getWeather = async (lat, long) => {
    
    try{
        const response = await fetch(`/api/weather?lat=${lat}&long=${long}`);

        if(!response.ok){
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();

        console.log(data);
        return data
    } catch(error){
        console.log(error);
    }

}


const extractLocationInfo = (data) => {
    
};




