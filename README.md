# Weather Application

A dynamic weather application that provides real-time weather data, 5-day forecasts, location-based background images, and interesting facts about searched locations.

## Why I built this
I wanted to improve on my javascript skills and so instead of just watching tutorials I decided to build something. I feel like 
through my program we went throgh JS->React->Next JS a bit too fast and thought it would be best to work on fundamentals.

![Weather App Screenshot](https://i.imgur.com/B6B7K5J.jpeg)

## Live Demo

[View Live Application](https://weather-app-ebon-kappa-45.vercel.app/)

##  Features

- **Real-time Weather Data**: Get current weather conditions for any location worldwide
- **5-Day Forecast**: View upcoming weather predictions with high/low temperatures
- **Smart Location Search**: Enter any location (city, address, or region) and get accurate weather data
- **Dynamic Backgrounds**: Location and weather-specific images powered by Unsplash API
- **Local Facts**: Discover interesting facts about searched locations via Google Gemini AI
- **Responsive Design**: Clean, modern interface with toggle-able UI elements
- **Custom Weather Icons**: Visual representation of weather conditions

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **APIs**:
  - Google Geocoding API (location coordinates)
  - Google Weather API (weather data)
  - Google Gemini API (location facts)
  - Unsplash API (dynamic backgrounds)
- **Fonts**: JetBrains Mono (Google Fonts)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js installed on your machine
- API keys for:
  - Google Geocoding API
  - Google Weather API
  - Google Gemini API
  - Unsplash API

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd weather-app
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys
```
GOOGLE_GEOCODING_API_KEY=your_key_here
GOOGLE_WEATHER_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
UNSPLASH_API_KEY=your_key_here
```

4. Start the development server
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## How It Works

### Data Flow

1. **User Input**: User enters a location in the search bar
2. **Geocoding**: The app converts the location to latitude/longitude coordinates using Google Geocoding API
3. **Weather Fetch**: Coordinates are used to fetch current weather and 5-day forecast
4. **Visual Enhancement**: 
   - Unsplash API fetches a relevant background image based on location and weather
   - Gemini API retrieves interesting facts about the location
5. **Display**: All data is rendered dynamically on the interface

### API Endpoints

- `/api/geocoding?address={location}` - Get coordinates from location name
- `/api/weather?lat={lat}&long={long}` - Get current weather data
- `/api/weather-forecast?lat={lat}&long={long}` - Get 5-day forecast
- `/api/weather-icon?url={iconUrl}` - Fetch weather icon images
- `/api/image?country={country}&weather={weather}` - Get location-specific background
- `/api/news?location={location}` - Get location facts from Gemini AI

## Features Breakdown

### Main Weather Display
- Current temperature in Celsius
- Weather description and icon
- Location name (city, locality, country)
- Timestamp of last update

### 5-Day Forecast
- Daily weather icons
- High and low temperatures
- Weather descriptions
- Day of the week

### Sidebar Features
- Search functionality
- "Did you know?" facts section
- Info modal with app details
- Hide/Show UI toggle for distraction-free viewing

## Learning Objectives

This project was built to:
- Practice JavaScript fundamentals
- Work with multiple external APIs
- Handle asynchronous operations (async/await)
- Implement Express.js server-side routing
- Create responsive and interactive UI elements
- Manage state and DOM manipulation

## UI Controls

- **Search Bar**: Enter any location to get weather data
- **Info Button**: Learn more about the app and its features
- **Hide UI Button**: Toggle UI elements for a cleaner view focused on the background image

##  Future Enhancements

- Temperature unit toggle (Celsius/Fahrenheit)
- Geolocation detection for automatic weather
- Weather alerts and notifications
- Favorite locations list
- Hourly forecast view
- Dark/light theme toggle

## Acknowledgments

- Google APIs for geocoding and weather data
- Unsplash for beautiful location imagery
