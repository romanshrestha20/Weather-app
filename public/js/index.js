// js/index.js

const searchCity = document.querySelector('input[name="city"]');
const searchButton = document.querySelector('button[type="submit"]');
const weatherInfo = document.querySelector('.weather-info');

searchButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent form submission

    const city = searchCity.value.trim();
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    try {
        const response = await axios.post('/weather', { city });
        const weatherData = response.data;
    
        // Update the weather info section
        const weatherHTML = `
        
            <h3>Weather of ${weatherData.city}</h3>
            <p>Temperature: ${weatherData.temperature}°C</p>
            <p>Minimum Temperature: ${weatherData.temp_min}°C</p>
            <p>Pressure: ${weatherData.pressure} hPa</p>
            <p>Description: ${weatherData.description}</p>
        `;
        weatherInfo.innerHTML = weatherHTML;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherInfo.innerHTML = '<p>Failed to fetch weather data. Please try again later.</p>';
    }
    
});
