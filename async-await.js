// first
// playing with promises
var request = require('request');

function getTC39Repos() {
  return new Promise((resolve, reject) => {
    request('https://api.github.com/users/tc39/repos', function (error, response, body) {
      if(error) {
        return reject(error)
      }
      return resolve(body)
    });
  });
}

getTC39Repos().then(function (a) {
  console.log('a', a);
}, function(a) {
  console.log('b', a);
});
