// first
// playing with promises
var weatherLisbon = 'https://www.metaweather.com/api/location/742676/';
var request = require('request');

function getTC39Repos() {
  return new Promise((resolve, reject) => {
    request(weatherLisbon, function (error, response, body) {
      if(error) {
        return reject(error);
      }
      return resolve(JSON.parse(body).consolidated_weather[0]);
    })
  })
}

getTC39Repos().then(function (a) {
    console.log(a)
}, function(a) {
    console.log(a)
});
