/*
    INTERFACE TO CONTROL HUBS and Their related path

    GOAL : 
    1) ADD / REMOVE HUB (120 I2C addresses)
    2) ADD / REMOVE CONNECTED DEVICE (address reservation by hub)
    3) SELECT / CHANGE CONNECTED DEVICE 
    4) VISUALIZE CONNECTIONS --> could be the main frame / then enter edit Mode
*/

class App {
	constructor() {
		this.isEditing = { state: false, hub: null, id: null };
		this.database = firebase.database();
		// init FB connection
		this.fbInitListeners();
		// interaction
		this.listeners();
		// add HUB generator
		this.UI();
	}

	listeners() {
		this.hubClickHandler = this.hubOnClick.bind(this);
	}
	hubOnClick(e) {
		//generate adresses
		// address is the i2c address needed on both arduino and RAPSBERRY
		// name is the name of the device (should be explicit enough)
		// type : 0 == none , 1 == input, 2 == output, 3 == input/output
		// connection is the info to which device that adress is connected
		// @hub_name is the name of the hub of the connected device
		// @ id is the id of the connected device on that predefined hub
		const I2C_adresses = [];
		for (let i = 7; i < 120; i++) {
			const address_config = {
				address: '0x' + i,
				name: 'undefined',
				type: 0,
				connection: { hub_name: 'none', id: 'none' },
				message: 'none'
			};
			I2C_adresses.push(address_config);
		}

		if (this.hub_textField.value != '' && this.hub_textField.value != 'HUB name') {
			this.send('HUBS/' + this.hub_textField.value, I2C_adresses);
			this.hub_textField.value = 'HUB name';
		}
	}

	fbInitListeners() {
		// DETECT AND LIST EXISTING HUBS
		this.existingHUBS = {};
		this.database.ref('HUBS').on('value', (snapshot) => {
			let value = snapshot.val();
			if (value) {
				const allKeys = Object.keys(value);
				for (let key of allKeys) {
					// generate HUB
					if (!this.existingHUBS[key]) {
						const hub = new Hub(this, key, value[key]);
						this.existingHUBS[key] = hub;
					} else {
						// update existing hub
						this.existingHUBS[key].update(value[key]);
					}
				}
			}
		});
	}
	UI() {
		this.UI_wrapper = document.createElement('div');
		this.UI_wrapper.className = 'ui';
		document.body.appendChild(this.UI_wrapper);
		//
		//add HUB
		const addHub = document.createElement('i');
		addHub.className = 'material-icons';
		addHub.classList.add('head-icon');
		addHub.textContent = 'device_hub';
		// add text field
		this.hub_textField = document.createElement('input');
		this.hub_textField.className = 'hub_textField';
		this.hub_textField.value = 'HUB name';
		this.UI_wrapper.appendChild(addHub);
		this.UI_wrapper.appendChild(this.hub_textField);
		addHub.addEventListener('click', this.hubClickHandler);
	}

	send(_type, _data = null) {
		// _data = {'data': _data, 't_created': time};
		this.database.ref(_type).set(_data);
	}
}

window.onload = (e) => {
	new App();
};
