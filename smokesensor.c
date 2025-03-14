#include <stdio.h>
#include <pigpio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <unistd.h>
#include <errno.h>
#include <curl/curl.h>
#define SPI_MAX_CLOCK_HZ 8000000
#define SPI_MODE 0

#define SPI_BUS 0
#define SPI_DEVICE 0
#define EN_PIN 4
#define ZPHS01B_ADDR 0xFF

#define DEVICE "/dev/ttyAMA2"
#define BAUD_RATE 9600
#define ID 2

#define RS485_ENABLE_PIN 7
#define HIGH 1
#define LOW 0
#define REG_DEVID_AD 0x00
#define REG_DEVID_MST 0x01
#define REG_REVID 0x03
#define REG_STATUS 0x04
#define RTEMP 0x07
#define XDATA3 0x08
#define XDATA2 0x09
#define XDATA1 0x0A
#define YDATA3 0x0B
#define YDATA2 0x0C
#define YDATA1 0x0D
#define ZDATA3 0x0E
#define ZDATA2 0x0F
#define ZDATA1 0x10
#define RANGE 0x2C
#define RSTATUS 0x04
#define RID 0x00
#define RFIFOENTRIES 0x05
#define POWER_CTL 0x2D
//shadow reg
#define SREG0 0x50
#define SREG1 0x51
#define SREG2 0x52
#define SREG3 0x53
#define SREG4 0x54
#define RRESET 0x2F
#define RSTATUS 0x04
#define SET_RANGE_10G 0x01
#define SET_RANGE_20G 0x02
#define SET_RANGE_40G 0x03

#define SET_ODR_4000 0b0000
#define SET_ODR_2000 0b0001
#define SET_ODR_1000 0b0010
#define SET_ODR_500  0b0011
#define SET_ODR_250  0b0100
#define SET_ODR_125  0b0101
#define SET_ODR_62_5 0b0110
#define SET_ODR_31_25 0b0111
#define SET_ODR_15_625 0b1000
#define SET_ODR_7_813 0b1001
#define SET_ODR_3_906 0b1010

#define READ_BIT 0x01
#define WRITE_BIT 0x00
#define MEASURE_MODE 0x00
#define RESET 0x52
#define DUMMY_BYTE 0xAA
#define STOP 0x01
#define CALI_BUF_LEN 15
#define CALI_INTERVAL_TIME 250
#define CHIP_SELECT_PIN  14

int spi_handle;

void initSPI() {
    if (gpioInitialise() < 0) {
        fprintf(stderr, "Failed to initialize pigpio\n");
        exit(1);
    }

    spi_handle = spiOpen(SPI_BUS, SPI_MAX_CLOCK_HZ, SPI_MODE); 
    if (spi_handle < 0) {
        fprintf(stderr, "Failed to open SPI bus\n");
        exit(1);
    }

    gpioSetMode(CHIP_SELECT_PIN, PI_OUTPUT);
}

void write_data(uint8_t address, uint8_t value) {
    uint8_t dataToSend[] = {(address << 1) | WRITE_BIT, value};
	gpioWrite(CHIP_SELECT_PIN, LOW);
    spiWrite(spi_handle, (char *)dataToSend, sizeof(dataToSend));
	gpioWrite(CHIP_SELECT_PIN, HIGH);
}

uint8_t read_data(uint8_t address) {
    uint8_t dataToSend = (address << 1) | READ_BIT;
    uint8_t dataReceived;
	gpioWrite(CHIP_SELECT_PIN, LOW);
    spiXfer(spi_handle, (char *)&dataToSend, (char *)&dataReceived, 2);
	gpioWrite(CHIP_SELECT_PIN, HIGH);
    return dataReceived;
}

void start()
{
	uint8_t data = read_data(POWER_CTL);
	write_data(POWER_CTL,MEASURE_MODE);
	printf("Power control register %d\n", read_data(POWER_CTL));
}


void reset()
{
	write_data(0x2F,0x52);
}
void set_range(uint8_t range) {

	switch (range)
	{
		case SET_RANGE_10G: write_data(RANGE,SET_RANGE_10G); break;

		case SET_RANGE_20G: write_data(RANGE,SET_RANGE_20G); break;

		case SET_RANGE_40G: write_data(RANGE,SET_RANGE_40G); break;

		default : break;
	}
}


void get_axes(double *x, double *y, double *z)
{
	uint8_t axisAddress = XDATA3;

	uint8_t axisMeasures[10];

	axisMeasures[0] = (axisAddress << 1) | READ_BIT;


	if (spiXfer(spi_handle, (char *)axisMeasures, (char *)axisMeasures, 10) == -1) {
	        printf("error occured\n");
	   }


	int32_t xdata = (axisMeasures[1] << 12) | (axisMeasures[2] << 4) | (axisMeasures[3] >> 4);
	int32_t ydata = (axisMeasures[4] << 12) | (axisMeasures[5] << 4) | (axisMeasures[6] >> 4);
	int32_t zdata = (axisMeasures[7] << 12) | (axisMeasures[8] << 4) | (axisMeasures[9] >> 4);

	if (xdata & 0x80000)
	{
		xdata = (xdata & 0x7FFFF) - 0x80000;
	}
	if (ydata & 0x80000)
	{
		ydata = (ydata & 0x7FFFF) - 0x80000;
	}
	if (zdata & 0x80000)
	{
		zdata = (zdata & 0x7FFFF) - 0x80000;
	}

	double factor = 1.0f / 12800.0f;
	double xr,yr,zr;

	xr  = (double) xdata * factor;
	yr  = (double) ydata * factor;
	zr  = (double) zdata * factor;

	*x = xr;
	*y = yr;
	*z = zr;

//	printf("X_axis : %.3f Y_axis: %.3f Z_axis : %.3f\n", xr, yr, zr);
}
void setFilter(uint8_t hpf, uint8_t lpf) {
    write_data(0x28, (hpf << 4) | lpf);
}

int readDump(uint8_t reg, uint8_t *buf, int len) {
    uint8_t sendBuf[len + 1];
    sendBuf[0] = reg | 0x01;

    gpioWrite(CHIP_SELECT_PIN, PI_LOW);

    spiXfer(spi_handle, (char*)sendBuf, (char*)sendBuf, len + 1);

    gpioWrite(CHIP_SELECT_PIN, PI_HIGH);

    memcpy(buf, sendBuf + 1, len);

    return 1;
}
void dumpInfo() {
    printf("ADXL357 SPI Info Dump\n");

    uint8_t buf[64];

    if (readDump(REG_DEVID_AD, buf, 3)) {
        printf("Analog Devices ID: %#02x\n", buf[0]);
        printf("Analog Devices MEMS ID: %#02x\n", buf[1]);
        printf("Device ID: %#02x\n", buf[2]);
    } else {
        printf("Reading ID Registers Failed!\n");
    }

    if (readDump(POWER_CTL, buf, 1)) {
        printf("Power Control Status:%d %s\n", buf[0], buf[0] & STOP ? "--> Standby" : "--> Measurement Mode");
    } else {
        printf("Reading Power CTL Failed !\n");
    }
}

void sendData(int serialPort, unsigned char* data, int length) {
	 gpioSetMode(RS485_ENABLE_PIN, PI_OUTPUT);
	 gpioWrite(RS485_ENABLE_PIN, HIGH);
	 serWrite(serialPort, data, length);
	 usleep(length * 10000000/9600);
	 gpioWrite(RS485_ENABLE_PIN, LOW);
}
void sendSerialData(int serialPort,  char* data, int length) {
//	write(serialPort, data, length);
        serWrite(serialPort, data, length);
}
struct MemoryStruct {
    char *memory;
    size_t size;
};

size_t write_to_memory_callback(void *buffer, size_t size, size_t nmemb, void *userp) {

    size_t realsize = size * nmemb;
    struct MemoryStruct *mem = (struct MemoryStruct *) userp;
    char *ptr = (char *) realloc(mem->memory, mem->size + realsize + 1);

    if(!ptr) {
        printf("not enough memory (realloc returned NULL)\n");
        return 0;
    }

    mem->memory = ptr;
    memcpy(&(mem->memory[mem->size]), buffer, realsize);
    mem->size += realsize;
    mem->memory[mem->size] = 0;

    return realsize;
}
int main(){
	CURL *curl;
	CURLcode res;
	curl = curl_easy_init();
	if(!curl){
		fprintf(stderr,"CURL initialize failed\n");
		return 1;
	}
	if(gpioInitialise() < 0) {
		fprintf(stderr, "Unable to initialize\n");
		return 1;
	}
	spi_handle = spiOpen(SPI_DEVICE, SPI_MAX_CLOCK_HZ, SPI_MODE);
	int serialPort = serOpen("/dev/ttyAMA3", 9600,0);
	gpioSetMode(RS485_ENABLE_PIN,PI_OUTPUT);

	set_range(SET_RANGE_40G);

	setFilter(0x00, 0x03);

	if(serialPort == -1) {
		fprintf(stderr, "Unable to open");
		return 1;
	}
	int serial_port = serOpen("/dev/ttyAMA2", 9600, 0);

	if (serial_port < 0) {
	         fprintf(stderr, "Unable to open serial port: %s\n", strerror(errno));
	         return 1;
	} else {
	         printf("Serial port opened successfully\n");
	}

        int sensorPort = serOpen("/dev/ttyAMA1", 9600, 0);
	if (sensorPort < 0) {
	        fprintf(stderr, "Serial port opening failed\n");
	        return -1;
	}
	char buffer[100];
	char sensorDataString[512];
        unsigned char command[] = {ZPHS01B_ADDR, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
//        int arrayLength = sizeof(command) / sizeof(command[0]);
	unsigned char data[] = {0x53, 0x00, 0x0C, 0x05, 0x01, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x14, 0x45};
//	int data_length = sizeof(data) / sizeof(data[0]);
	unsigned char sensor[] = {0xFF, 0x86, 0x00, 0x00, 0x00, 0x06, 0x02, 0x02, 0x03};
	unsigned char receivedSensor[50];
//    unsigned char receivedData[100];
	while(1) {
		    sendData(serialPort, data, sizeof(data));
	             time_sleep(0.5);
		    sendSerialData(serial_port, command, sizeof(command));
	             time_sleep(0.5); 
		    serWrite(serialPort, sensor, sizeof(sensor));
		     time_sleep(0.5);
		    unsigned char receivedData[100];
		    int count = 26;
		    for(int i = 0; i < count; i++) {
				receivedData[i] = serReadByte(serialPort);
		    }
			time_sleep(0.5);
		    char data[26];
	        for (int i = 0; i < 26; i++) {
	            data[i] = serReadByte(serial_port);
        	}
			time_sleep(0.5);
		    for (int i = 0; i < 9; i++) {
		        receivedSensor[i] = serReadByte(sensorPort);
	        }

		int opStateMSB = receivedData[8];
		int opStateLSB = receivedData[9];
		int opState = (opStateMSB << 8) | opStateLSB;
		int bit2 = (opState >> 1)&1;
		int bit3 = (opState >> 2)&1;

/*	        int tempMSB = receivedData[11];
	        int tempLSB = receivedData[12];
        	int temperature = (tempMSB << 8) | tempLSB;

	        int humiMSB = receivedData[13];
	        int humiLSB = receivedData[14];
        	int humidity = (humiMSB << 8) | humiLSB;*/

	        int warningTempMSB = receivedData[15];
	        int warningTempLSB = receivedData[16];
	        int warningTemp = (warningTempMSB << 8) | warningTempLSB;

	        int alarmTempMSB = receivedData[17];
	        int alarmTempLSB = receivedData[18];
	        int alarmTemp = (alarmTempMSB << 8) | alarmTempLSB;

		double warningT = (double)warningTemp / 100.0;
		double alarmT = (double)alarmTemp / 100.0;

	        double temp = ((data[11] * 256 + data[12]) - 500) * 0.1;
		double humi = data[13] * 256 + data[14];
                double pm25 = (data[4] * 256 + data[5]) / 10.0;
                double pm10 =  (data[6] * 256 + data[7]) / 10.0;
                double pm1 = (data[2] * 256 + data[3]) /10.0;
                double co2 = (data[8] * 256 + data[9]);
		double voc = data[10];
                double ch2o = (data[15] * 256 + data[16]) * 0.0001/10.0;
                double co = (data[17] * 256 + data[18]) * 0.1;
                double o3 = (data[19] * 256 + data[20]) * 0.1;
                double no2 = (data[21] * 256 + data[22]) * 0.1;

		double h2sData = (receivedSensor[2] * 256 + receivedSensor[3]) / 10;
		time_sleep(0.5);
		double xr,yr,zr;
		get_axes(&xr, &yr, &zr);
		double dataToSet[] = {temp, humi, pm25, pm10, pm1, co2, voc, ch2o, co, o3, no2, xr, yr, zr, h2sData, warningT, alarmT};

		int numVal = sizeof(dataToSet) / sizeof(dataToSet[0]);

		 snprintf(sensorDataString, sizeof(sensorDataString),
	            "{\"id\": 2,\"temp\":%.2f, \"humidity\":%.2f,\"pm25\":%.2f,\"pm10\":%.2f,"
	            "\"pm1\": %.2f, \"co2\": %.0f, \"voc\": %.0f, \"ch2o\":  %.3f, \"co\": %.3f, \"o3\": %.3f,"
	            "\"no2\": %.3f, \"x\": %.3f, \"y\": %.3f, \"z\": %.3f,  \"h2s\": %.0f, \"wargningTemp\": %.1f, \"alarmTemp\": %.1f}",
	            temp, humi, pm25, pm10, pm1, co2, voc, ch2o, co, o3, no2, xr, yr, zr, h2sData, warningT, alarmT);
//		 fflush(stdout);
//		 printf("\n");
   		 if(curl) {
				struct MemoryStruct data;
                                data.memory = malloc(1);
                                data.size = 0;

				struct curl_slist *headers = NULL;

				headers = curl_slist_append(headers, "Content-Type: application/json");

				curl_easy_setopt(curl, CURLOPT_URL, "http://feelink.iptime.org:5001/setdata");

				curl_easy_setopt(curl, CURLOPT_NOSIGNAL, 1L);

				curl_easy_setopt(curl, CURLOPT_POST, 1L);

				curl_easy_setopt(curl, CURLOPT_POSTFIELDS, sensorDataString);

				curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

				curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_to_memory_callback);

                                curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&data);

				res = curl_easy_perform(curl);

				if(res != CURLE_OK) {
					fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
				}

//					curl_slist_free_all(headers);
					free(data.memory);
				}

		}
		curl_easy_cleanup(curl);
		gpioTerminate();
		return 0;
}

