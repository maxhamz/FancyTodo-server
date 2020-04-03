const axios = require('axios')
const URL = 'https://freegeoip.app/json/'

function getLocation() {
    return axios({
        method: 'GET',
        url: URL
    })
    .then(response => {
        let lat = response.data.latitude
        let lon = response.data.longitude
        let latLon = {
            lat,
            lon
        }

        // req.location = latLon
        // next()

        return latLon

    }) 
    .catch(err => {
        console.log("ERROR FETCHING GEOLOCATION");
        console.log(err);
        // next(err)
    })

}

module.exports = { getLocation }