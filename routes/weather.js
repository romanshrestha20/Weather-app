const express = require('express');
const axios = require('axios'); // Require Axios
const router = express.Router();

const apiKey = process.env.API_KEY; // Ensure you have your API key set in your environment variables
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';


// Route to handle rendering the home page
router.get('/', (req, res) => {
    res.render('index', { weather: null, error: null });
});

// Route to handle fetching weather data based on city name
router.post('/weather', async (req, res) => {
    const { city } = req.body;
    console.log('City:', city); // Log the city to check its value

    try {
        const response = await axios.get(apiUrl, {
            params: {
                q: city,
                units: 'metric',
                appid: apiKey
            }
        });
        

        // Axios automatically throws an error for non-2xx responses
        const data = response.data;
        const weather = {
            city: data.name,
            temperature: data.main.temp,
            temp_min: data.main.temp_min,
            temp_max: data.main.temp_max,
            pressure: data.main.pressure,
            description: data.weather[0].description,
            icon: data.weather[0].icon
        };
        res.json(weather); // Send the weather data as JSON
        // res.render('index', { weather: weather, error: null });
    } catch (error) {
        console.error('Axios error:', error); // Log the Axios error for debugging
        res.status(500).json({ error: 'Internal server error' }); // Send a generic error response
    }
});

module.exports = router;
