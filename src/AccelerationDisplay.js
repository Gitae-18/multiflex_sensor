import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import './main.css';
const AccelerationDisplay = () => {
  const [receivedData, setReceivedData] = useState([]);
  const [receiveData, setReceiveData] = useState([]);
  const [loading, setLoading] = useState(false);
/*   const [receiveData, setReceiveData] = useState({
    xArray: [],
    yArray: [],
    zArray: [],
  })
  const [update, setUpdate] = useState({
    x: new Array(100).fill(NaN),
    y: new Array(100).fill(NaN),
    z: new Array(100).fill(NaN),
  }); */
  const arraySize = 100;
  const [intervalId, setIntervalId] = useState(null);
/*   const fetchData = async() => {
    try{
      const response = await fetch('http://192.168.0.36:4001/getrsdata');
      const data = await response.json();
      setReceiveData(data);
      console.log('데이터를 성공적으로 받았습니다:', data);
    }
    catch(error){
      console.error('데이터를 받는 도중 오류가 발생했습니다:', error);
    }
  } */
  const fetchDataFromServer = async () => {
    try {
      const response = await fetch('http://feelink.iptime.org:5001/getdata');
      const data = await response.json();
      setReceivedData(data);
      if(response.ok){
        setLoading(true);
      } else {
        setLoading(false);
      }
      console.log('데이터를 성공적으로 받았습니다:', data);
     /*  setUpdate((prevData) => {
        const currentIndex = (prevData.currentIndex + 1) % arraySize;

        return {
          x: [
            ...prevData.x.slice(0, currentIndex),
            data.x,
            ...prevData.x.slice(currentIndex + 1),
          ],
          y: [
            ...prevData.y.slice(0, currentIndex),
            data.y,
            ...prevData.y.slice(currentIndex + 1),
          ],
          z: [
            ...prevData.z.slice(0, currentIndex),
            data.z,
            ...prevData.z.slice(currentIndex + 1),
          ],
          currentIndex,
        };
      });
      setReceiveData((prevData) => ({
        xArray: [...prevData.xArray, data.x],
        yArray: [...prevData.yArray, data.y],
        zArray: [...prevData.zArray, data.z],
      }));
       */
      // 받은 데이터를 상태에 저장하거나 다른 작업을 수행할 수 있습니다.
    } catch (error) {
      console.error('데이터를 받는 도중 오류가 발생했습니다:', error);
    }
  };
  useEffect(() => {

      const id = setInterval(fetchDataFromServer, 100);
      //const sub = setInterval(fetchData, 100);
      setIntervalId(id);

    return () => {
      clearInterval(intervalId);
    };
  }, [receivedData]);
  
  return (
    <div>
       <div className="logo">
            <img src="./images/logo.jpg" alt="no-image" width={300}/>          
            <h3 style={{textAlign:'center'}}>스마트 안전 복합센서 <strong style={{fontSize:'20px'}}><u>실시간 모니터링 시스템</u></strong></h3>
            <div></div>
          </div>
          <div className="horizontal-line"/>
          <div style={{padding:'10px 100px'}}>
          {receivedData && (
            <>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',flexWrap:'wrap'}}>
              <div className="sensor-card">
              <div className="sensor-header">Temperature</div>
              <div className="sensor-body">
                <img src="./images/temp.png" id="temp" alt="temperature-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">온도센서</div>
              <div className="sensor-value">{receivedData.temp} ℃</div>
              </div>
              </div>
              <div className="sensor-card">
              <div className="sensor-header">Humidity</div>
              <div className="sensor-body">
                <img src="./images/humidity.png" id="temp" alt="humidity-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">습도</div>
              <div className="sensor-value">{receivedData.humidity} %</div>
              </div>
              </div>
              <div className="sensor-card">
              <div className="sensor-header">PM1.0</div>
              <div className="sensor-body">
                <img src="./images/PM.png" id="temp" alt="pm1.0-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">미세먼지</div>
              <div className="sensor-value">{receivedData.pm1} ㎍/㎥</div>
              </div>
              </div>
              <div className="sensor-card">
              <div className="sensor-header">PM2.5</div>
              <div className="sensor-body">
                <img src="./images/PM.png" id="temp" alt="pm2.5-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">미세먼지</div>
              <div className="sensor-value">{receivedData.pm25} ㎍/㎥</div>
              </div>
              </div>
              <div className="sensor-card">
              <div className="sensor-header">PM10</div>
              <div className="sensor-body">
                <img src="./images/PM.png" id="temp" alt="pm10-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">미세먼지</div>
              <div className="sensor-value">{receivedData.pm10} ㎍/㎥</div>
              </div>
              </div>
              <div className="sensor-card">
              <div className="sensor-header">CO2</div>
              <div className="sensor-body">
                <img src="./images/co2.png" id="temp" alt="Co2-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">이산화탄소</div>
              <div className="sensor-value">{receivedData.co2} ppm</div>
              </div>
              </div>
          </div>
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',flexWrap:'wrap'}}>
          <div className="sensor-card">
          <div className="sensor-header">O3</div>
          <div className="sensor-body">
            <img src="./images/ozone.png" id="temp" alt="O3-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">오존</div>
          <div className="sensor-value">{receivedData.o3} ppm</div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">NO2</div>
          <div className="sensor-body">
            <img src="./images/NO2.png" id="temp" alt="no2-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">이산화질소</div>
          <div className="sensor-value">{receivedData.no2} ppm</div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">VOC</div>
          <div className="sensor-body">
            <img src="./images/voc.png" id="temp" alt="voc-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">유기화합물</div>
          <div className="sensor-value">{receivedData.voc} ppm</div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">H2S</div>
          <div className="sensor-body">
            <img src="./images/h2s.png" id="temp" alt="h2s-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">황화수소</div>
          <div className="sensor-value">{receivedData.h2s} ppm</div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">Vibration Sensor</div>
          <div className="sensor-body">
            <img src="./images/vibrate.png" id="temp" alt="temperature-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">진동센서</div>
          <div className="sensor-value-v">{receivedData.x} g</div>
          <div className="sensor-value-v">{receivedData.y} g</div>
          <div className="sensor-value-v">{receivedData.z} g</div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">Smoke/Fire sensor</div>
          <div className="sensor-body">
            <img src="./images/smoke.png" id="temp" alt="temperature-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">화재/연기센서</div>
          <div className="sensor-value-v">Warn : {receivedData.wargningTemp} ℃</div>
          <div className="sensor-value-v">Alarm : {receivedData.alarmTemp} ℃</div>
          </div>
          </div>
        </div>
        </>
        )}
        </div>
        <div className="bottom">
        <div className="horizontal-line"/>
        </div>
    </div>
  );
};

export default AccelerationDisplay;

 {/*  <Plot
            data={[
              { y: update.x, name: 'X' },
              { y: update.y, name: 'Y' },
              { y: update.z, name: 'Z' },
            ]}
            layout={{
              title: 'XYZ Data',
              width: 1900, // Set the width of the chart
              height: 700, // Set the height of the chart
            }}
          /> */}
         
          {/* <p>X: {receiveData.xArray[receiveData.xArray.length - 1]}</p>
          <p>Y: {receiveData.yArray[receiveData.yArray.length - 1]}</p>
          <p>Z: {receiveData.zArray[receiveData.zArray.length - 1]}</p> */}