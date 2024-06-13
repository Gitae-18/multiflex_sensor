const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const timeout = require('connect-timeout');
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

let storedData = {}; // Ensure storedData is initialized properly

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
    
    const selectedData = storedData[selectedID] ||  '-';

    if (selectedData === '-') {
        return res.status(404).json({
            status: 'error',
            error: 'Requested data not found or not updated',
        });
    }
    
    res.status(200).json(selectedData);
});

app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
});
