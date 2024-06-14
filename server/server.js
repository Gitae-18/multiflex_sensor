const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const timeout = require('connect-timeout');
const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

let storedData = {}; // Ensure storedData is initialized properly
let lastReceivedTime = {}; // Store the last received time for each ID
const DATA_EXPIRATION_MS = 5000; // Data expiration time in milliseconds (1 second)

// Default response object for expired or missing data
const defaultData = {
    temp: '-',
    humidity: '-',
    pm1: '-',
    pm25: '-',
    pm10: '-',
    co2: '-',
    o3: '-',
    no2: '-',
    voc: '-',
    h2s: '-',
    x: '-',
    y: '-',
    z: '-',
    warningTemp: '-',
    alarmTemp: '-',
};

app.post('/setdata', (req, res) => {
    const data = req.body;
    console.log('Received data:', data);  // Log the received data for debugging

    if (!data || typeof data !== 'object') {
        return res.status(400).json({
            status: 'error',
            error: 'Request body cannot be empty or invalid format',
        });
    }
    if (!data.id) {
        return res.status(400).json({
            status: 'error',
            error: 'Invalid data format. The "id" property is missing.',
        });
    }

    // Ensure storedData is an object and properly handle the data
    if (typeof storedData !== 'object' || storedData === null) {
        storedData = {};
    }
    storedData[data.id] = data;
    lastReceivedTime[data.id] = Date.now(); // Update the last received time for the given ID

    res.status(200).json(data);
});

app.use(timeout('15s'));

app.get('/getdata', (req, res) => {
    const selectedID = req.query.id;

    if (!selectedID) {
        return res.status(400).json({
            status: 'error',
            error: 'ID parameter is missing in the request',
        });
    }
    
    const currentTime = Date.now();
    const lastTime = lastReceivedTime[selectedID];
    const isDataExpired = !lastTime || (currentTime - lastTime) > DATA_EXPIRATION_MS;

    if (isDataExpired) {
        return res.status(200).json(defaultData); // Return default data if the data is expired or never received
    }
    
    const selectedData = storedData[selectedID] || defaultData;
    
    res.status(200).json(selectedData);
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
