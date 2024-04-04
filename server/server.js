const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const timeout = require('connect-timeout');
const port = 5001;
app.use(cors());
app.use(bodyParser.json());
app.post('/', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
app.get('/', (req, res) => {
    console.log('success');
    res.send('Hello, this is the root path!');
});
let storedData = {};
//let storedData2 = {};

app.post('/setdata', (req, res) => {
    const data = req.body;
    const ID = req.body.id;
    //sendData = data;
    storedData = null;
    if (!req.body) {
        return res.status(400).json({
            status: 'error',
            error: 'req body cannot be empty',
        });
    }
    if (!data) {
        // 데이터가 전송되지 않은 경우 storedData를 비우고 에러 메시지를 반환
        storedData = {};
        return res.status(400).json({
            status: 'error',
            error: '데이터가 전송되지 않았습니다. 연결이 끊겼습니다.',
        });
    }
    // 여기에서 React 서버에 데이터 전달 등의 작업 수행
    if (!data && !data.id) {
        return res.status(400).json({
            status: 'error',
            error: '올바르지 않은 데이터 형식입니다. 요청 본문에 "id" 속성이 포함되어 있는지 확인하세요.',
        });
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
    
    /* const selectedData = selectedID === '1' ? storedData : selectedID === '2' ? storedData2 : storedData; */
    const selectedData = storedData[selectedID] ||  '-';

    if (!selectedData) {
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