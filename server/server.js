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
    storedData = (data);
    console.log(storedData);
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

    if (!storedData) {
        return res.status(404).json({
            status: 'error',
            error: 'Data not found',
        });
    }
    let filteredData;
    // 저장된 데이터에서 해당 ID 값과 일치하는 모든 데이터 찾기
    if (Array.isArray(storedData)) {
        // 배열이라면 filter 사용 가능
         filteredData = storedData.filter(item => item.id === parseInt(selectedID));
        // 이후 로직 작성
    } else {
        // 배열이 아닐 경우에 대한 처리
        console.error('storedData is not an array');
    }

    if (!filteredData || filteredData.length === 0) {
        return res.status(404).json({
            status: 'error',
            error: 'Data not found for the specified ID',
        });
    }

    // 찾은 데이터를 클라이언트에 응답
    res.status(200).json(filteredData);
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