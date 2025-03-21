import React, { useState, useEffect, useCallback, useRef } from "react";
import Plot from "react-plotly.js";
import './main.css';
const AccelerationDisplay = () => {
  const [receivedData, setReceivedData] = useState([]);
  //const [receiveData, setReceiveData] = useState([]);
  /* const [prevDeviceID, setPrevDeviceID] = useState("");
  const [loading, setLoading] = useState(false); */
  const [deviceID, setDeviceID] = useState("1");
  const arraySize = 100;
  const [intervalId, setIntervalId] = useState(null);
  const [device, setDevice] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const tableRef = useRef(null);
  const toggleVisibility = () => {
        setIsVisible(!isVisible);
        if (!isVisible) {
          // 📌 표가 열릴 때 해당 위치로 스크롤 이동
          setTimeout(() => {
              tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 300); // 애니메이션이 끝나는 시점에 스크롤 이동
      }
  };

  const selectID = (event) => {
    const selectedID = event.target.value;
    setDeviceID(selectedID);
    // 선택된 센서 ID를 state에 업데이트
    // 다른 작업도 필요하다면 여기에 추가할 수 있습니다.
  };

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
const getPMBackgroundColor = (value, type) => {
  if (value === '-' || value === undefined) return '#ccc'; // 데이터 없을 때 회색
  
  if (type === "pm10") {
      if (value <= 30) return "#4CAF50"; // 초록색 (좋음)
      if (value <= 80) return "#FFEB3B"; // 노랑 (보통)
      if (value <= 150) return "#FF9800"; // 주황 (나쁨)
      return "#F44336"; // 빨강 (매우 나쁨)
  } else if (type === "pm25") {
      if (value <= 15) return "#4CAF50"; // 초록색 (좋음)
      if (value <= 35) return "#FFEB3B"; // 노랑 (보통)
      if (value <= 75) return "#FF9800"; // 주황 (나쁨)
      return "#F44336"; // 빨강 (매우 나쁨)
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
              <div className="sensor-card" style={{ backgroundColor: getPMBackgroundColor(receivedData.pm25, "pm25") }}>
              <div className="sensor-header">PM2.5</div>
              <div className="sensor-body">
                <img src="./images/PM.png" id="temp" alt="pm2.5-image"/>
              </div>
              <div className="sensor-footer">
              <div className="sensor-type">초미세먼지</div>
              <div className="sensor-value">{receivedData.pm25} ㎍/㎥</div>
              </div>
              </div>
              <div className="sensor-card" style={{ backgroundColor: getPMBackgroundColor(receivedData.pm10, "pm10") }}>
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
          <div className="sensor-value" style={{position:'relative',top:'7px'}}>{receivedData.no2 / 1000.0} ppm</div>
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
          <div className="sensor-header" style={receivedData.nowTemp > 70?{backgroundColor:'#c70f0f'}:{backgroundColor:'#043b75'}}>Smoke/Fire sensor</div>
          <div className="sensor-body" style={receivedData.nowTemp > 70?{backgroundColor:'#c70f0f'}:{backgroundColor:'#94bbe6'}}>
            <img src="./images/smoke.png" id="temp" alt="temperature-image"/>
          </div>
          <div className="sensor-footer">
          <div className="sensor-type">화재/연기센서</div>
          <div style={{marginTop:'8px'}}>
          <div className="sensor-value-v">Temp : {receivedData.nowTemp > 400  ? "-" : receivedData.nowTemp} ℃</div>
          <div className="sensor-value-v">Alarm : {receivedData.alarmTemp > 400  ? "-" : receivedData.alarmTemp} ℃</div>
          </div>
          </div>
          </div>
        </div>
        </>
        )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
            {/* 타이틀 및 보기 버튼 */}
            <div 
                onClick={toggleVisibility} 
                style={{
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: '#f4f4f4',
                    border: '1px solid #ccc'
                }}
            >
                대기환경 기준표 {isVisible ? '▲' : '▼'}
            </div>

            {/* 표 전체 컨테이너 (숨김/보임 적용) */}
            <div ref={tableRef}   className={`hidden-content ${isVisible ? 'open' : ''}`}
                style={{
                    maxHeight: isVisible ? '1000px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.5s ease-in-out',
                    marginTop: '10px'
                }}
            >
                {/* 미세먼지 기준표 */}
                <h3 style={{ marginBottom: '15px' }}>미세먼지 등급 기준</h3>
                <table style={{
                    width: '80%',
                    margin: '0 auto',
                    borderCollapse: 'collapse',
                    border: '1px solid #ccc',
                    fontSize: '16px'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #bbb' }}>
                            <th style={{ padding: '10px', borderRight: '1px solid #bbb' }}>등급</th>
                            <th style={{ padding: '10px', borderRight: '1px solid #bbb'}}>미세먼지 (㎍/㎥)</th>
                            <th style={{ padding: '10px' }}>초미세먼지 (㎍/㎥)</th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #ccc' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>좋음</td>
                          <td style={{ backgroundColor: '#008000', color: 'white', fontWeight: 'bold', padding: '10px', borderRight: '1px solid #ccc' }}>0 ~ 30</td>
                          <td style={{ backgroundColor: '#008000', color: 'white', fontWeight: 'bold', padding: '10px' }}>0 ~ 15</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ccc' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>보통</td>
                          <td style={{ backgroundColor: '#FFD700', color: 'black', fontWeight: 'bold', padding: '10px', borderRight: '1px solid #ccc' }}>31 ~ 80</td>
                          <td style={{ backgroundColor: '#FFD700', color: 'black', fontWeight: 'bold', padding: '10px' }}>16 ~ 35</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ccc' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>나쁨</td>
                          <td style={{ backgroundColor: '#FF8C00', color: 'white', fontWeight: 'bold', padding: '10px', borderRight: '1px solid #ccc' }}>81 ~ 150</td>
                          <td style={{ backgroundColor: '#FF8C00', color: 'white', fontWeight: 'bold', padding: '10px' }}>36 ~ 75</td>
                      </tr>
                      <tr>
                          <td style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>매우나쁨</td>
                          <td style={{ backgroundColor: '#FF0000', color: 'white', fontWeight: 'bold', padding: '10px', borderRight: '1px solid #ccc' }}>151 이상</td>
                          <td style={{ backgroundColor: '#FF0000', color: 'white', fontWeight: 'bold', padding: '10px' }}>76 이상</td>
                      </tr>
                  </tbody>
                </table>

                {/* 오존 및 이산화질소 기준표 */}
                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>오존 및 이산화질소 대기환경기준</h3>
                <table style={{
                    width: '80%',
                    margin: '0 auto',
                    borderCollapse: 'collapse',
                    border: '1px solid #ccc',
                    fontSize: '16px'
                }}>
                   <colgroup>
                      <col style={{ width: '30%' }} /> 
                      <col style={{ width: '25%' }} /> 
                      <col style={{ width: '45%' }} /> 
                  </colgroup>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #bbb !important' }}>
                            <th style={{ padding: '10px', borderRight: '1px solid #bbb ' }}>오염물질</th>
                            <th style={{ padding: '10px', borderRight: '1px solid #bbb' }}>구분</th>
                            <th style={{ padding: '10px' }}>기준치 (ppm)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>오존 (O₃)</td>
                            <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>8시간 평균치</td>
                            <td style={{ padding: '10px' }}>0.06</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>오존 (O₃)</td>
                            <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>1시간 평균치</td>
                            <td style={{ padding: '10px' }}>0.1</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>이산화질소 (NO₂)</td>
                            <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>1시간 평균치</td>
                            <td style={{ padding: '10px' }}>0.1</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #ccc'}}>이산화질소 (NO₂)</td>
                            <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>연평균치</td>
                            <td style={{ padding: '10px' }}>0.03</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bottom">
        </div>
    </div>
  );
};

export default AccelerationDisplay;


