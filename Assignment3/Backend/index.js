const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const Favourite = require('./models/WeatherData');

const app = express();
app.use(cors());
const PORT = 8080;
const MONGODB_URI="mongodb+srv://vishwasprkh1:csci571assignment3@assignment3.dbbuw.mongodb.net/?retryWrites=true&w=majority&appName=Assignment3";
const TOMORROW_API_KEY="QakEu5yV6q22F0Wk860PPqnz10xkASUe";

const fieldsByDuration = {
    day: [
        "temperatureMin",
        "temperatureMax",
        "windSpeed",
        "windDirection",
        "humidity",
        "weatherCode",
        "precipitationProbability",
        "precipitationType",
        "sunriseTime",
        "sunsetTime",
        "temperature",
        "pressureSeaLevel",
        "uvIndex",
        "visibility",
        "cloudCover"
    ],
    hour: [
        "temperature",
        "windSpeed",
        "windDirection",
        "humidity",
        "pressureSeaLevel"
    ]
};

app.use(express.json());

mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.post('/add-favourite', async (req, res) => {
    const { city, state, latitude, longitude } = req.body;
    try {
        const newFav = new Favourite({ city, state, latitude, longitude });
        await newFav.save();
        res.status(201).json({message: 'Location added to favourites', favourite: newFav});
    } catch(error){
        console.error('Error adding location:', error);
        res.status(500).json({error: 'Failed to add location to favourites'});
    }
});

app.delete('/remove-favourite', async (req, res) => {
    const { city, state, latitude, longitude } = req.body;
    try {
        const deletedFavourite = await Favourite.findOneAndDelete({ city, state, latitude, longitude });
        if (deletedFavourite) {
            res.json({ message: 'Location removed successfully from favourites', favourite: deletedFavourite});
        } else{
            res.status(404).json({error: 'Location not found'});
        }
    } catch (error) {
        console.error('Error removing location:', error);
        res.status(500).json({ error: 'Failed to remove location from favourites'});
    }
});

app.get('/get-favourites', async (req, res) => {
    try {
        const favourites = await Favourite.find();
        res.json(favourites);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve favorites' });
    }
});

app.get('/autocomplete', async (req, res) => {
    const {input} = req.query;
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
        params: {
          input: input,
          types: 'geocode',
          key: 'AIzaSyAbmhdhCPUCtM45icTZRpTtgv7gyeR-n-8'
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching data from Google Places API:', error);
      res.status(500).json({ error: 'Failed to fetch data from Google Places API' });
    }
});

app.get('/weather', async (req, res) => {
    const {latitude, longitude, duration} = req.query;

    try {
        const timestepBasedOnDuration = duration==="day"?"1d":"1h";
        const tomorrowResponse = await axios.get(`https://api.tomorrow.io/v4/timelines`, {
            params: {
                location: `${latitude},${longitude}`,
                fields: fieldsByDuration[duration],
                timezone: "America/Los_Angeles",
                units: "imperial",
                startTime: "now",
                endTime: "nowPlus5d", 
                timesteps: timestepBasedOnDuration,
                apikey: TOMORROW_API_KEY
            }
        });
        res.json(tomorrowResponse.data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data'});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});