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
        let data = {
            lat,
            lon
        }
        return data
        // return res.status(200).json({lat, lon})

    }) 
    .catch(err => {
        console.log("ERROR FETCHING GEOLOCATION");
        next(err)
    })

}

module.exports = { getLocation }