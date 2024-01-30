const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const wsModule =require('ws');
const port = 5001;
app.use(cors());
app.use(bodyParser.json());
app.post('/', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
let storedData = null;
//let storedRsData = null;
//let filteredData = null;
app.get('/', (req, res) => {
    console.log('success');
    res.send('Hello, this is the root path!');
});

app.post('/setdata', (req, res) => {
    const data = req.body;
    //sendData = data;
    if (!req.body) {
        return res.status(400).json({
            status: 'error',
            error: 'req body cannot be empty',
        });
    }
    // 여기에서 React 서버에 데이터 전달 등의 작업 수행
    storedData = data;
    res.status(200).json(data);
});

app.get('/getdata', (req, res) => {
    const selectedID = req.query.id;

    if (!selectedID) {
        return res.status(400).json({
            status: 'error',
            error: 'ID parameter is missing in the request',
        });
    }

/*     if (!storedData || !Array.isArray(storedData)) {
        return res.status(404).json({
            status: 'error',
            error: 'Data not found or storedData is not an array',
        });
    }
 */
    // storedData를 배열로 변환
    const selectedData = storedData.filter(data => data.id === selectedID);

    console.log(`storedData:${storedData}`);
    res.status(200).json(selectedData);
    /* if (selectedData) {
        console.log(storedData);
       
    } else {
        res.status(404).json({
            status: 'error',
            error: 'Data not found for the specified ID',
        });
    } */
});
/* app.use(express.static(path.join(__dirname, '/build')));
 */
// 메인페이지 접속 시 build 폴더의 index.html 보내줘
/* app.get('/', (req, res) => {
  req.sendFile(path.join(__dirname, '/build/index.html'));
})
app.get('*', (req, res) => {
    req.sendFile(path.join(__dirname, '/build/index.html'));
  }); */
app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
});