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
  const fetchData = async() => {
    try{
      const response = await fetch('http://192.168.0.36:4001/getrsdata');
      const data = await response.json();
      setReceiveData(data);
      console.log('데이터를 성공적으로 받았습니다:', data);
    }
    catch(error){
      console.error('데이터를 받는 도중 오류가 발생했습니다:', error);
    }
  }
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
    if(loading) {
      const id = setInterval(fetchDataFromServer, 100);
      //const sub = setInterval(fetchData, 100);
      setIntervalId(id);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [receivedData]);

  return (
    <div>
    <div className="logo">
      <img src="./images/logo.jpg" alt="no-image" width={300}/>          
      <h3 style={{textAlign:'center'}}>스마트 안전 복합센서 <strong style={{fontSize:'20px'}}><u>실시간 모니터링 시스템</u></strong></h3>
    </div>
    <div className="horizontal-line"></div>
    {receivedData && receivedData.map((item, index) => (
      <div key={index} className="sensor-card">
        <div className="sensor-header">이산화탄소</div>
        <div className="sensor-body">
          <div className="sensor-type">CO2</div>
          <div className="sensor-value">{item.co2Value} ppm</div>
        </div>
      </div>
    ))}
    <div className="bottom">
      <div className="horizontal-line"></div>
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