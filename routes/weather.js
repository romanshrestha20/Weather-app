const express = require('express');
const axios = require('axios');
const router = express.Router();

const apiKey = process.env.API_KEY; // Ensure this is set in your environment variables
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const apiUrlForecast = 'https://api.openweathermap.org/data/2.5/forecast';

router.get('/', (req, res) => {
    res.render('index', { weather: null, error: null, fourDayForecast: null });
});

router.post('/weather', async (req, res) => {
    const { city } = req.body;

    if (!city) {
        return res.status(400).json({ error: 'City name is required' });
    }

    try {
        // Fetch current weather data
        const weatherResponse = await axios.get(apiUrl, {
            params: {
                q: city,
                units: 'metric',
                appid: apiKey
            }
        });
        const weather = weatherResponse.data;

        // Fetch forecast data
        const forecastResponse = await axios.get(apiUrlForecast, {
            params: {
                q: city,
                units: 'metric',
                appid: apiKey
            }
        });
        const fourDayForecast = processForecastData(forecastResponse.data.list);

        // Send response with weather and forecast data
        res.json({
            weather: {
                city: weather.name,
                temperature: weather.main.temp,
                temp_min: weather.main.temp_min,
                pressure: weather.main.pressure,
                description: weather.weather[0].description
            },
            fourDayForecast: fourDayForecast // This contains the next 5 days' forecast
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to process forecast data
function processForecastData(forecastList) {
    // Extract relevant information for each day (date, temperature, description)
    return forecastList.map(forecast => ({
        date: forecast.dt_txt,
        temperature: forecast.main.temp,
        description: forecast.weather[0].description
    }));
}

module.exports = router;
