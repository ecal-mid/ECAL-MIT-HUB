const admin = require('firebase-admin');
// const express = require('express'); // DEBUG
const SerialPort = require('serialport');
// FULL PATH OF FIREBASE CONFIG FILE
const serviceAccount = require('/Users/gaelhugo/Documents/gitHub/ECAL-HUB/virtualhub/config/ecal-mit-hub-firebase-adminsdk-ux5en-cc8b3b6512.json'); // UPDATE THIS
const arduinoCOMPort = '/dev/cu.usbmodem14501'; // UPDATE THIS
const HUB_NAME = 'HUB_ECAL2'; // UPDATE THIS

////////////////////////////////////////////////////////////////////////
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://ecal-mit-hub.firebaseio.com' /* UPDATE THIS WITH THE PROPER FB PROJECT*/
});

const ADDRESSES = {};
const ADDRESSES_ID = {};
let FULL_DATA = null;
let hub_started = false;
let connected_device = null;
// Get a database reference to our posts
const db = admin.database();
db.ref('HUBS').on(
	'value',
	(snapshot) => {
		// --> ALL HUBS AND CONNECTIONS
		let data = snapshot.val();
		FULL_DATA = data;
		initDatas(data);
		if (!hub_started) {
			iniArduino();
			hub_started = true;
		} else {
			readMessage();
		}
	},
	(errorObject) => {
		console.log('The read failed: ' + errorObject.code);
	}
);

function readMessage() {
	// get connection
	const local = ADDRESSES[connected_device];
	// get id for connected device
	const id = local['connection']['id'];
	const hub = local['connection']['hub_name'];
	const message = FULL_DATA[hub][id]['message'];

	// send that info to the device -->
	// add new line for arduino
	arduinoSerialPort.write(message + '\n');

	console.log('----');
	console.log(message, id, hub);
}

let receivedData = '';
let sendData = '';
const port = 3000;
let arduinoSerialPort = null;

function iniArduino() {
	arduinoSerialPort = new SerialPort(arduinoCOMPort, {
		baudRate: 9600
	});
	arduinoSerialPort.on('open', () => {
		console.log('Serial Port ' + arduinoCOMPort + ' is opened.');
	});
	arduinoSerialPort.on('error', (err) => {
		console.log('Error', err);
	});

	arduinoSerialPort.on('data', (data) => {
		str = data.toString(); //Convert to string
		str = str.replace(/\r?\n|\r/g, ''); //remove '\r' from this String
		receivedData += str;
		if (receivedData.indexOf('%') >= 0 && receivedData.indexOf('*') >= 0) {
			// save the data between 'B' and 'E'
			sendData = receivedData.substring(receivedData.indexOf('*') + 1, receivedData.indexOf('%'));
			receivedData = '';
			if (!connected_device) {
				connected_device = '0x' + sendData;
				console.log(connected_device);
			} else {
				//send to firebase
				console.log('send to firebase', sendData);
				// get connection
				const local = ADDRESSES[connected_device];
				// get id for connected device
				const id = local['id'];
				// const hub = local['hub_name'];
				db.ref('HUBS/' + HUB_NAME + '/' + id + '/message').set(sendData);
			}
		}
	});
}

function initDatas(data) {
	for (let i = 0; i < data[HUB_NAME].length; i++) {
		const address = data[HUB_NAME][i];
		ADDRESSES_ID[i] = { address: address['address'], connection: address['connection'] };
		ADDRESSES[address['address']] = { id: i, connection: address['connection'] };
	}
}

// // WEB PORTAL
// const app = express();
// app.get('/', (req, res) => {
// 	return res.send('Working');
// });

// app.get('/:action', (req, res) => {
// 	const action = req.params.action || req.param('action');

// 	if (action == 'on') {
// 		arduinoSerialPort.write('o');
// 		return res.send('Led light is on!');
// 	}
// 	if (action == 'off') {
// 		arduinoSerialPort.write('f');
// 		return res.send('Led light is off!');
// 	}

// 	return res.send('Action: ' + action);
// });

// app.listen(port, () => {
// 	console.log('Example app listening on port http://0.0.0.0:' + port + '!');
// });
