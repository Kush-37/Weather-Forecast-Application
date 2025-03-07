const apiKey = '822be4073a83ebfad056ea8850387754';
const apiUrl = 'https://api.openweathermap.org/data/2.5/';

// Reference to html using their id
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const recentCities = document.getElementById('recent-cities');
const recentContainer = document.getElementById('recent-container');
const weatherContainer = document.getElementById('weather-container');
const forecastContainer = document.getElementById('forecast-container');
const cityNameEl = document.getElementById('city-name');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const forecastEl = document.getElementById('forecast');

let firstSearchMade = false;

//function to fetch weather data from API
async function fetchWeather(city) {
    try {
        const response = await fetch(`${apiUrl}weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeather(data);
        fetchForecast(city);
        saveRecentCity(city);
        if (!firstSearchMade) {
            firstSearchMade = true;
            recentContainer.classList.remove('hidden');
        }
    } catch (error) {
        alert(error.message);
    }
}


//Function to fetch forecast data
async function fetchForecast(city) {
    try {
        const response = await fetch(`${apiUrl}forecast?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('Forecast not available');
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error(error);
    }
}

//Function to display weather data
function displayWeather(data) {
    cityNameEl.textContent = data.name;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    temperatureEl.textContent = `Temperature: ${data.main.temp}°C`;
    humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeedEl.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    weatherContainer.classList.remove('hidden');
}


//Function to display 5 days forecast
function displayForecast(data) {
    forecastEl.innerHTML = '';
    const dailyForecasts = data.list.filter((item) => item.dt_txt.includes('12:00:00'));
    dailyForecasts.forEach((day) => {
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('p-3', 'bg-gray-200', 'rounded-lg', 'text-center', 'justify-items-center');
        forecastItem.innerHTML = `
            <p class="font-bold">${new Date(day.dt_txt).toLocaleDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon">
            <p>${day.main.temp}°C</p>
            <p>${day.wind.speed} m/s</p>
            <p>${day.main.humidity}% Humidity</p>
        `;
        forecastEl.appendChild(forecastItem);
    });
    forecastContainer.classList.remove('hidden');
}


//Function for current loaction data fetch
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`${apiUrl}weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
                if (!response.ok) throw new Error('Location data unavailable');
                const data = await response.json();
                displayWeather(data);
                fetchForecast(data.name);
                if (!firstSearchMade) {
                    firstSearchMade = true;
                    recentContainer.classList.remove('hidden');
                }
            } catch (error) {
                alert(error.message);
            }
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}


//Function for saving recent city in local storage
function saveRecentCity(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(cities));
    }
    updateRecentCities();
}

function updateRecentCities() {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentCities.innerHTML = '<option value="">Select a city</option>';
    cities.forEach(city => {
        let option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCities.appendChild(option);
    });
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
    else alert('Please enter a city name.');
});

locationBtn.addEventListener('click', getLocation);

recentCities.addEventListener('change', (event) => {
    if (event.target.value) fetchWeather(event.target.value);
});

updateRecentCities();