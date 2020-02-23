class Device {
	constructor(scope, hub, id) {
		this.scope = scope;
		this.parentHUB = hub;
		this.id = id;
		this.wrapper = document.createElement('div');
		this.wrapper.className = 'device';
		this.parentHUB.wrapper.appendChild(this.wrapper);
		this.getDeviceData();
	}

	getDeviceData() {
		this.scope.database
			.ref('HUBS/' + this.parentHUB.name + '/' + this.id)
			.once('value')
			.then((snapshot) => {
				const value = snapshot.val();
				this.updateContent(value);
			});
	}

	getAllHubs() {
		const data = this.scope.database
			.ref('HUBS')
			.once('value')
			.then((snapshot) => {
				const value = snapshot.val();
				return value;
			});
		return data;
	}

	getConnection(path) {
		const data = this.scope.database
			.ref(path)
			.once('value')
			.then((snapshot) => {
				const value = snapshot.val();
				return value;
			});
		return data;
	}

	async updateContent(content) {
		// I2C info
		const title = document.createElement('span');
		title.textContent = content.address;
		this.buildBlock('YOUR I2C address', title);

		// Name info
		const textField = document.createElement('input');
		textField.value = content.name;
		this.buildBlock('Your device name', textField);
		textField.addEventListener('keydown', this.onKeyDown.bind(this));

		// type info
		const buttons = document.createElement('div');
		const list = [
			{ name: 'none', val: 0 },
			{ name: 'input', val: 1 },
			{ name: 'output', val: 2 },
			{ name: 'input/output', val: 3 }
		];
		for (let i = 0; i < list.length; i++) {
			const group = document.createElement('div');
			const radio = document.createElement('input');
			radio.type = 'radio';
			radio.value = list[i].val;
			radio.checked = content.type == list[i].val ? true : false;
			const radio_label = document.createElement('label');
			radio_label.textContent = list[i].name;
			group.appendChild(radio);
			group.appendChild(radio_label);
			buttons.appendChild(group);
		}
		buttons.addEventListener('click', this.radioOnClick.bind(this));
		this.buildBlock('Your device type', buttons);

		//connection info
		this.previousConnection = content.connection;
		const data = await this.getAllHubs();
		const connection = this.buildSelectors(data, content.connection, { hub: this.parentHUB.name, id: this.id });
		connection.addEventListener('change', this.onChange.bind(this));
		this.buildBlock('Your are connected to', connection);

		//sending message
		const textField2 = document.createElement('input');
		// textField2.value = content.name;
		textField2.setAttribute('data-hub', this.parentHUB.name);
		textField2.setAttribute('data-id', this.id);
		textField2.className = 'bigger';
		this.buildBlock('You are sending', textField2);
		textField2.addEventListener('keydown', this.onKeyDownSendAndReceived.bind(this));
		console.log('HUBS/' + this.parentHUB.name + '/' + this.id + '/message');

		this.FBListener('HUBS/' + this.parentHUB.name + '/' + this.id + '/message', textField2);

		//received message
		const textField3 = document.createElement('input');
		// textField2.value = content.name;
		textField3.setAttribute('data-hub', content.connection['hub_name']);
		textField3.setAttribute('data-id', content.connection['id']);
		textField3.className = 'bigger';
		this.buildBlock('You are receiving', textField3);
		textField3.addEventListener('keydown', this.onKeyDownSendAndReceived.bind(this));
		this.FBListener(
			'HUBS/' + content.connection['hub_name'] + '/' + content.connection['id'] + '/message',
			textField3
		);
	}
	buildBlock(_title, _htmlContent) {
		const block = document.createElement('div');
		block.className = 'block';
		const info = document.createElement('div');
		info.className = 'info';
		const title = document.createElement('div');
		title.className = 'title';
		title.textContent = _title + ' : ';
		info.appendChild(title);
		const html = document.createElement('div');
		html.className = 'html';
		html.appendChild(_htmlContent);
		info.appendChild(html);
		block.appendChild(info);
		this.wrapper.appendChild(block);
	}

	radioOnClick(e) {
		if (e.target.type == 'radio') {
			const radios = e.target.parentNode.parentNode.getElementsByTagName('input');
			Array.from(radios).forEach((radio) => {
				radio.checked = false;
			});
			e.target.checked = true;
			// update FB
			this.updateFB('/HUBS/' + this.parentHUB.name + '/' + this.id + '/type/', e.target.value);
		}
	}
	onKeyDown(e) {
		//Validate new name
		if (e.keyCode == 13) {
			if (e.target.value == '' || e.target.value == 'undefined') {
				this.reset();
			} else {
				this.updateFB('/HUBS/' + this.parentHUB.name + '/' + this.id + '/name/', e.target.value);
			}
			e.target.blur();
		}
	}

	onKeyDownSendAndReceived(e) {
		if (e.keyCode == 13) {
			if (e.target.value != '' && !isNaN(e.target.value)) {
				const hub = e.target.getAttribute('data-hub');
				const id = e.target.getAttribute('data-id');
				this.updateFB('/HUBS/' + hub + '/' + id + '/message/', e.target.value);
			}
			e.target.blur();
		}
	}
	// onKeyDownReceive(e) {
	// 	if (e.keyCode == 13) {
	// 		if (e.target.value != '' && !isNaN(e.target.value)) {
	// 			const hub = e.target.getAttribute('data-hub');
	// 			const id = e.target.getAttribute('data-id');
	// 			this.updateFB('/HUBS/' + hub + '/' + id + '/message/', e.target.value);
	// 		}
	// 		e.target.blur();
	// 	}
	// }

	updateFB(path, data) {
		const updates = {};
		updates[path] = data;
		this.scope.database.ref().update(updates);
	}
	buildSelectors(hubs, connection, active) {
		const allKeys = Object.keys(hubs);
		const selectors = document.createElement('div');
		for (let key of allKeys) {
			const data = hubs[key];
			const wrapper = document.createElement('div');
			wrapper.className = 'selectors';
			if (connection.hub_name == key) {
				wrapper.classList.add('active');
			}
			const legend = document.createElement('span');
			legend.className = 'small';
			legend.textContent = key;
			const selector = this.parentHUB.buildSelector(data, connection, active, key);
			wrapper.appendChild(legend);
			wrapper.appendChild(selector);
			selectors.appendChild(wrapper);
		}
		return selectors;
	}

	FBListener(path, target) {
		this.scope.database.ref(path).on('value', (snapshot) => {
			const value = snapshot.val();
			target.value = value;
		});
	}
	async onChange(e) {
		if (e.target.value != 'Please choose a device') {
			const connection = { hub_name: e.target.id, id: e.target.value };
			const updates = {};

			// remove my own previous connection (if existing)
			if (this.previousConnection.hub_name != 'none') {
				updates[
					'HUBS/' + this.previousConnection.hub_name + '/' + this.previousConnection.id + '/connection'
				] = {
					hub_name: 'none',
					id: 'none'
				};
			}

			// add your own connection
			updates['HUBS/' + this.parentHUB.name + '/' + this.id + '/connection'] = connection;

			// get remote device previous connection
			const remote_connection = await this.getConnection(
				'HUBS/' + connection.hub_name + '/' + connection.id + '/connection'
			);

			// remove remote device previous connection
			if (remote_connection.hub_name != 'none') {
				updates['HUBS/' + remote_connection.hub_name + '/' + remote_connection.id + '/connection'] = {
					hub_name: 'none',
					id: 'none'
				};
			}

			// add remote device connection
			updates['HUBS/' + connection.hub_name + '/' + connection.id + '/connection'] = {
				hub_name: this.parentHUB.name,
				id: this.id
			};

			//send all to FB
			this.scope.database.ref().update(updates);
		}
	}

	reset() {
		const updates = {};
		// remove my own previous connection (if existing)
		if (this.previousConnection.hub_name != 'none') {
			updates['HUBS/' + this.previousConnection.hub_name + '/' + this.previousConnection.id + '/connection'] = {
				hub_name: 'none',
				id: 'none'
			};
		}
		// add your own connection
		updates['HUBS/' + this.parentHUB.name + '/' + this.id + '/connection'] = {
			hub_name: 'none',
			id: 'none'
		};

		//reset name
		updates['/HUBS/' + this.parentHUB.name + '/' + this.id + '/name/'] = 'undefined';

		//reset type
		updates['/HUBS/' + this.parentHUB.name + '/' + this.id + '/type/'] = '0';

		//send all to FB
		this.scope.database.ref().update(updates);
	}
}
