document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const weatherForm = document.getElementById('weatherForm');
    const cityInput = document.getElementById('cityInput');
    const weatherInfo = document.querySelector('.weather-info');
    const forecastContainer = document.getElementById('forecastContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const getLocationBtn = document.getElementById('getLocationBtn');

    // Event listeners
    weatherForm.addEventListener('submit', handleFormSubmit);
    getLocationBtn.addEventListener('click', handleUseMyLocation);

    // Function to handle form submission
    async function handleFormSubmit(event) {
        event.preventDefault();
        const city = cityInput.value.trim();
        if (!city) {
            alert('Please enter a city name');
            return;
        }
        await fetchWeatherData(city);
    }

    // Function to handle "Use My Location" button click
    async function handleUseMyLocation() {
        if ('geolocation' in navigator) {
            try {
                loadingIndicator.style.display = 'block';
                const position = await getCurrentPosition();
                const city = await getCityName(position.coords.latitude, position.coords.longitude);
                await fetchWeatherData(city);
            } catch (error) {
                console.error('Error fetching location:', error);
                loadingIndicator.style.display = 'none';
                alert('Failed to retrieve your location. Please enter a city name manually.');
            }
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }

    // Function to fetch weather data based on city name
    async function fetchWeatherData(city) {
        try {
            const { data } = await axios.post('/weather', { city });
            loadingIndicator.style.display = 'none';

            if (!data.weather || !data.weather.city) {
                throw new Error('Invalid weather data');
            }

            displayWeatherInfo(data.weather, data.fourDayForecast);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            loadingIndicator.style.display = 'none';
            let errorMessage = 'An error occurred. Please try again later.';
            if (error.response && error.response.status === 404) {
                errorMessage = 'City not found. Please enter a valid city name.';
            }
            displayError(errorMessage);
        }
    }

    // Function to get current position
    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    // Function to get city name from latitude and longitude
    async function getCityName(latitude, longitude) {
        try {
            const reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
            const response = await axios.get(reverseGeocodeUrl);
            return response.data[0].name;
        } catch (error) {
            console.error('Error fetching city name:', error);
            return null; // Handle the error gracefully
        }
    }

    // Function to display weather information
    function displayWeatherInfo(weather, forecastData) {
        const groupedForecast = groupForecastByDay(forecastData);

        const weatherHTML = `
            <h3>Weather in ${weather.city}</h3>
            <p>Temperature: ${weather.temperature}°C</p>
            <p>Minimum Temperature: ${weather.temp_min}°C</p>
            <p>Pressure: ${weather.pressure} hPa</p>
            <p>Description: ${weather.description}</p>
        `;
        weatherInfo.innerHTML = weatherHTML;

        const forecastHTML = Object.keys(groupedForecast).map(day => `
            <div class="forecast-item">
                <h4 class="font-semibold" >${day}</h4>
                ${groupedForecast[day].map(item => `
                    <div>
                        <p>Time: ${extractTime(item.date)}</p>
                        <p class="text-gray-600">Temperature: ${item.temperature}°C</p>
                        <p class="text-gray-600">Description: ${item.description}</p>
                    </div>
                `).join('')}
            </div>
        `).join('');
        forecastContainer.innerHTML = forecastHTML;
    }

    // Function to display error message
    function displayError(message) {
        weatherInfo.innerHTML = `    <div class="flex items-center justify-center h-screen">
            <div class="bg-white p-8 rounded shadow-lg">
                <h1 class="text-4xl font-bold mb-4">404 Error</h1>
                <p class="text-gray-600">Oops! The page you're looking for could not be found.</p>
                <a href="/" class="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">Go back to homepage</a>
            </div>
        </div>`;
        forecastContainer.innerHTML = '';
    }

    // Function to group forecast data by day
    function groupForecastByDay(forecastData) {
        const groupedForecast = {};
        forecastData.forEach(item => {
            const date = new Date(item.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            if (!groupedForecast[dayName]) {
                groupedForecast[dayName] = [];
            }
            groupedForecast[dayName].push(item);
        });
        return groupedForecast;
    }

    // Function to extract time from datetime string
    function extractTime(dateTimeStr) {
        return dateTimeStr.split(' ')[1];
    }
});
