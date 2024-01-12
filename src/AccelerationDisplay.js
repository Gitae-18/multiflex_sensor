import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import './main.css';
const AccelerationDisplay = () => {
  const [receivedData, setReceivedData] = useState([]);
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

  const fetchDataFromServer = async () => {
    try {
      const response = await fetch('http://feelink.iptime.org/getdata');
      const data = await response.json();
      setReceivedData(data);
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
    setIntervalId(id);

    // 컴포넌트가 언마운트될 때 인터벌 정리
    return () => {
      clearInterval(intervalId);
    };
  }, [receivedData]);

  return (
    <div>
      {/* update !== null && receiveData !== null &&  */receivedData && (
        <div>
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
          <h2 style={{textAlign:'center'}}>Sensor Data Values</h2>
          {/* <p>X: {receiveData.xArray[receiveData.xArray.length - 1]}</p>
          <p>Y: {receiveData.yArray[receiveData.yArray.length - 1]}</p>
          <p>Z: {receiveData.zArray[receiveData.zArray.length - 1]}</p> */}
          <table>
            <thead>
              <tr>
                <th scope="col" width="33.3%">Sensor name</th>
                <th scope="col">Values</th>
                <th scope="col">Unit</th>
              </tr>
            </thead>
            <tbody>
                <tr>
                  <th scope="row">Temperature</th>
                  <td>{receivedData.temp}</td>
                  <td> ºC </td>
                </tr>
                <tr>
                  <th scope="row">Humidity</th>
                  <td>{receivedData.humidity}</td>
                  <td>%</td>
                </tr>
                <tr>
                  <th scope="row">PM25</th>
                  <td>{receivedData.pm25}</td>
                  <td>ug/m3</td>
                </tr>
                <tr>
                  <th scope="row">PM10</th>
                  <td>{receivedData.pm10}</td>
                  <td>ug/m3</td>
                </tr>
                <tr>
                  <th scope="row">PM1</th>
                  <td>{receivedData.pm1}</td>
                  <td>ug/m3</td>
                </tr>
                <tr>
                  <th scope="row">CO2</th>
                  <td>{receivedData.co2}</td>
                  <td>ppm</td>
                </tr>
                <tr>
                  <th scope="row">O3</th>
                  <td>{receivedData.o3}</td>
                  <td>ppm</td>
                </tr>
                <tr>
                  <th scope="row">NO2</th>
                  <td>{receivedData.no2}</td>
                  <td>ppm</td>
                </tr>
                <tr>
                  <th scope="row">X-Axis</th>
                  <td>{receivedData.x}</td>
                  <td>g</td>
                </tr>
                <tr>
                  <th scope="row">Y-Axis</th>
                  <td>{receivedData.y}</td>
                  <td>g</td>
                </tr>
                <tr>
                  <th scope="row">Z-Axis</th>
                  <td>{receivedData.z}</td>
                  <td>g</td>
                </tr>
            </tbody>              
              
          </table>
        </div>
      )}
    </div>
  );
};

export default AccelerationDisplay;