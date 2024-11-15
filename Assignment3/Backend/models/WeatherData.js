const mongoose = require('mongoose');

const FavouriteSchema = new mongoose.Schema({
  city: String,
  state: String,
  latitude: Number,
  longitude: Number
});
  
module.exports = mongoose.model('WeatherData', FavouriteSchema);