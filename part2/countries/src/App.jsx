import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = 'https://restcountries.com/v3.1';

function App() {
  const [countries, setCountries] = useState([]);
  const [filter, setFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const API_KEY = '75462b7ed6695325995181b2b075b52a';

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        if (filter.trim() === '') {
          setCountries([]);
          return;
        }
        const response = await axios.get(`${API_URL}/name/${filter}`);
        const sortedCountries = response.data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sortedCountries);
        setErrorMessage('');
      } catch (error) {
        setCountries([]);
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
          setErrorMessage('No matches found');
        } else {
          setErrorMessage('Error fetching data');
        }
      }
    };

    const debounceTimeout = setTimeout(fetchCountries, 500);

    return () => clearTimeout(debounceTimeout);
  }, [filter]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (selectedCountry && selectedCountry.latlng.length === 2) {
        const [lat, lon] = selectedCountry.latlng;
        console.log('Fetching weather for:', selectedCountry.name.common);
        console.log('Lat:', lat, 'Lon:', lon);
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${selectedCountry.capital}&appid=${API_KEY}&units=metric`
          );
          setWeatherData(response.data);
        } catch (error) {
          console.error('Error fetching weather:', error);
          setWeatherData(null);
        }
      }
    };

    fetchWeather();
  }, [selectedCountry, API_KEY]);

  const handleButtonClick = (country) => {
    setSelectedCountry(country === selectedCountry ? null : country);
  };

  return (
    <div>
      <h1>Countries</h1>
      <label>
        Search for countries
        <input
          type="text"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </label>
      {errorMessage && <div>{errorMessage}</div>}
      <ul>
        {countries.map((country, index) => (
          <li key={index}>
            <div>
              <h2>{country.name.common}</h2>
              {selectedCountry === country && (
                <div>
                  <div>Capital: {country.capital}</div>
                  <div>Area: {country.area} km<sup>2</sup></div>
                  <h3>Languages</h3>
                  <ul>
                    {Object.values(country.languages).map((language, langIndex) => (
                      <li key={langIndex}>{language}</li>
                    ))}
                  </ul>
                  <div className="flex-container">
                    <div className="flex-item">
                      <h3>Flag</h3>
                      <img
                        src={country.flags?.png}
                        alt={`Flag of ${country.name.common}`}
                        width="250"
                      />
                    </div>
                    <div className="flex-item">
                      <h3>Coat of Arms</h3>
                      <img
                        src={country.coatOfArms?.svg}
                        alt={`Coat of Arms of ${country.name.common}`}
                        width="250"
                      />
                    </div>
                  </div>
                  {weatherData && (
                    <div>
                      <h3>Weather</h3>
                      <div>Current Temperature: {weatherData.main.temp} °C</div>
                      <div>Weather Description: {weatherData.weather[0].description}</div>
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => handleButtonClick(country)}>
                {selectedCountry === country ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
