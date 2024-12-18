import React, { useState, useEffect, useCallback } from "react";
import Plot from "react-plotly.js";
import './main.css';
const AccelerationDisplay = () => {
  const [receivedData, setReceivedData] = useState([]);
  const [receiveData, setReceiveData] = useState([]);
  const [prevDeviceID, setPrevDeviceID] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceID, setDeviceID] = useState("1");
  const arraySize = 100;
  const [intervalId, setIntervalId] = useState(null);
  const [device, setDevice] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const selectID = (event) => {
    const selectedID = event.target.value;
    setDeviceID(selectedID);
    // 선택된 센서 ID를 state에 업데이트
    // 다른 작업도 필요하다면 여기에 추가할 수 있습니다.
};
console.log(receivedData.wargningTemp)
  const fetchDataFromServer = useCallback(async () => {
    try {
     /*  if (deviceID !== prevDeviceID) {
        setLoading(true);
        setPrevDeviceID(deviceID); // 현재 deviceID를 저장
      } */
      const response = await fetch(`http://feelink.iptime.org:5001/getdata?id=${deviceID}`,{
        method: 'GET',
        headers: {
         'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('서버에서 에러를 반환했습니다.');
        setReceivedData({
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
        });
    } else {
        setReceivedData(data);
    }
    
    } catch (error) {
      console.error('데이터를 받는 도중 오류가 발생했습니다:', error);
    } /* finally {
      setLoading(false); // 데이터 수신 후 loading 비활성화
    } */
  },[deviceID]);
  
  useEffect(() => {

      const id = setInterval(fetchDataFromServer, 1000);

      setIntervalId(id);

    return () => {
      clearInterval(intervalId);
    };
  }, [receivedData, deviceID]); 
  const requestDevice = async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['c7bdb943-af8a-481f-bf8b-813d2fdd41fb'] }] // 원하는 서비스로 필터링
        });
        setDevice(device);
        console.log('Device selected:', device.name);
    } catch (error) {
        console.log('Error requesting device:', error);
    }
};

const connectDevice = async () => {
    if (!device) return;

    try {
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('c7bdb943-af8a-481f-bf8b-813d2fdd41fb');
        const characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
        const value = await characteristic.readValue();
        const batteryLevel = value.getUint8(0);
        setBatteryLevel(batteryLevel);
        console.log('Battery level:', batteryLevel);
    } catch (error) {
        console.log('Error connecting to device:', error);
    }
};
  return (
    <div>
       <div className="logo">
           {/*  <img id="logo" src="./images/logo.jpg" alt="no-image"/>   */}        
          <h3 style={{textAlign:'center', marginTop:'30px'}}>스마트 안전 복합센서 <strong style={{fontSize:'26px'}}><u>실시간 모니터링 시스템</u></strong></h3>     
          <select name="ids" id="id-select" onChange={selectID} value={deviceID}>
                <option value="" selected disabled>센서 선택</option>
                <option value="1">Sensor-1</option>
                <option value="2">Sensor-2</option>
                <option value="3">Sensor-3</option>
                <option value="4">Sensor-4</option>
                <option value="5">Sensor-5</option>
          </select>
        </div>
         {/* <h4>{loading?"connecting...":"connected !"}</h4> */}
          <div className="horizontal-line"/>
          <div style={{padding:'20px 100px'}}>
          {/* <button onClick={requestDevice}>Connect to BLE Device</button>
          {device && <button onClick={connectDevice}>Read Battery Level</button>} */}
          {receivedData && (
            <>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',flexWrap:'wrap'}}>
              <div className="sensor-card">
              <div className="sensor-header">Temperature</div>
              <div className="sensor-body">
                <img src="./images/temp.png" id="temp" alt="temperature-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">온도</div>
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
              <div className="sensor-value" style={{position:'relative',top:'7px'}}>{receivedData.humidity} %</div>
              
              </div>
              </div>
              <div className="sensor-card">
              <div className="sensor-header">PM1.0</div>
              <div className="sensor-body">
                <img src="./images/PM.png" id="temp" alt="pm1.0-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">극초미세먼지</div>
              <div className="sensor-value">{receivedData.pm1} ㎍/㎥</div>
              </div>
              </div>
              <div className="sensor-card">
              <div className="sensor-header">PM2.5</div>
              <div className="sensor-body">
                <img src="./images/PM.png" id="temp" alt="pm2.5-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">초미세먼지</div>
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
              <div className="sensor-value" style={{position:'relative',top:'10px'}}>{receivedData.co2} ppm</div>
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
          <div className="sensor-value" style={{position:'relative',top:'7px'}}>{receivedData.o3} ppm</div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">NO2</div>
          <div className="sensor-body">
            <img src="./images/NO2.png" id="temp" alt="no2-image" style={{width:'80%',height:'160%'}}/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">이산화질소</div>
          <div className="sensor-value" style={{position:'relative',top:'7px'}}>{receivedData.no2} ppm</div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">VOC</div>
          <div className="sensor-body">
            <img src="./images/voc.png" id="temp" alt="voc-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">유기화합물</div>
          <div className="sensor-value" style={{position:'relative',top:'7px'}}>{receivedData.voc} ppm</div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">H2S</div>
          <div className="sensor-body">
            <img src="./images/h2s.png" id="temp" alt="h2s-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">황화수소</div>
          <div className="sensor-value" style={{position:'relative',top:'7px'}}>{receivedData.h2s > 400 || receivedData.h2s < 0 ? "-" : receivedData.h2s} ppm</div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">Vibration Sensor</div>
          <div className="sensor-body">
            <img src="./images/vibrate.png" id="temp" alt="temperature-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">진동센서</div>
          <div style={{marginTop:'5px'}}>
          <div className="sensor-value-v">X:{receivedData.x} g</div>
          <div className="sensor-value-v">Y:{receivedData.y} g</div>
          <div className="sensor-value-v">Z:{receivedData.z} g</div>
          </div>
          </div>
          </div>
          <div className="sensor-card">
          <div className="sensor-header">Smoke/Fire sensor</div>
          <div className="sensor-body">
            <img src="./images/smoke.png" id="temp" alt="temperature-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">화재/연기센서</div>
          <div style={{marginTop:'8px'}}>
          <div className="sensor-value-v">Warn : {receivedData.wargningTemp > 400  ? "-" : receivedData.wargningTemp} ℃</div>
          <div className="sensor-value-v">Alarm : {receivedData.alarmTemp > 400  ? "-" : receivedData.alarmTemp} ℃</div>
          </div>
          </div>
          </div>
        </div>
        </>
        )}
        </div>
        <div className="bottom">
        </div>
    </div>
  );
};

export default AccelerationDisplay;


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