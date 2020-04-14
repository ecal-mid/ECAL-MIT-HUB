class Hub {
	constructor(scope, name, addresses) {
		this.scope = scope;
		this.parent = document.body;
		this.name = name;
		this.addresses = addresses;
		// console.log(addresses);
		this.wrapper = document.createElement('div');
		this.wrapper.className = 'wrapper';
		this.wrapper.name = name;

		this.parent.appendChild(this.wrapper);
		this.initListeners();
		this.buildHub();
	}
	initListeners() {
		this.changeHandler = this.selectorOnChange.bind(this);
	}
	update(addresses) {
		this.addresses = addresses;
		this.wrapper.innerHTML = '';
		this.buildHub();
		//in case we were editing
		if (this.scope.isEditing.state && this.scope.isEditing.hub == this.name) {
			this.createDevice(this.scope.isEditing.id);
		}
	}
	buildHub() {
		//add HUB
		const icon_support = document.createElement('div');
		icon_support.className = 'icon';
		const legend = document.createElement('span');
		legend.textContent = this.name;
		const addHub = document.createElement('i');
		addHub.className = 'material-icons';
		// addHub.classList.add('head-icon');
		addHub.textContent = 'device_hub';
		icon_support.appendChild(addHub);
		icon_support.appendChild(legend);
		this.wrapper.appendChild(icon_support);
		const selector = this.buildSelector(this.addresses);
		selector.addEventListener('change', this.changeHandler);
		this.wrapper.appendChild(selector);

		// add link to webcam
		//received message
		const textField = document.createElement('input');
		// textField.value = 'http://108.20.26.144:8081/';
		textField.setAttribute('data-hub', this.name);
		// textField.setAttribute('data-id', content.connection['id']);
		textField.className = 'normal';
		this.buildBlock('WebCam', textField);
		textField.addEventListener('keydown', this.onKeyDownSendAndReceived.bind(this));
		this.FBListener('WEBCAMS/' + this.name + '/webcam', textField);
	}

	buildSelector(addresses, connection, active, hub) {
		const selector = document.createElement('select');
		selector.id = !connection ? this.name : hub;
		const preoption = document.createElement('option');
		preoption.textContent = !connection ? 'Please choose an available  I2C address' : 'Please choose a device';
		selector.appendChild(preoption);
		// add addresses to the selector
		const address_keys = Object.keys(addresses);
		const types = { 0: 'none', 1: 'input', 2: 'output', 3: 'input/output' };

		for (let i = 0; i < address_keys.length; i++) {
			const address = addresses[address_keys[i]];
			const option = document.createElement('option');
			option.value = address_keys[i];
			if (!connection) {
				if (option.value == this.scope.isEditing.id && this.scope.isEditing.hub == this.name) {
					option.selected = true;
				}
				option.textContent =
					address.address +
					(address.name != 'undefined' ? ' ** ' + address.name + ' ** ' + types[address.type] : '');
				selector.appendChild(option);
			} else if (address.name != 'undefined' && (address_keys[i] != active.id || active.hub != hub)) {
				option.textContent = address.name + ' ** ' + types[address.type];
				selector.appendChild(option);
				if (option.value == connection.id && hub == connection.hub_name) {
					option.selected = true;
				}
			}
		}

		return selector;
	}

	selectorOnChange(e) {
		this.removeElementsByClass('device');
		this.createDevice(e.target.value);
	}
	createDevice(id) {
		new Device(this.scope, this, id);
		// deactivate all other hubs
		this.toggleElementsByClass('wrapper', 'off', this);
		this.scope.isEditing.state = true;
		this.scope.isEditing.hub = this.name;
		this.scope.isEditing.id = id;
	}

	toggleElementsByClass(className, newClass, exception) {
		var elements = document.getElementsByClassName(className);
		Array.from(elements).forEach((element) => {
			if (element.name != exception.name) {
				if (!element.classList.contains(newClass)) {
					element.classList.add(newClass);
				}
			}
		});
	}

	removeElementsByClass(className) {
		var elements = document.getElementsByClassName(className);
		while (elements.length > 0) {
			elements[0].parentNode.removeChild(elements[0]);
		}
	}

	buildBlock(_title, _htmlContent) {
		const block = document.createElement('div');
		block.className = 'block';
		const info = document.createElement('div');
		info.className = 'info';
		const title = document.createElement('div');
		title.className = 'title';
		title.innerHTML = '<a href="' + _htmlContent.value + '" target="_blank">' + _title + '</a>';
		info.appendChild(title);
		const html = document.createElement('div');
		html.className = 'html';
		html.appendChild(_htmlContent);
		info.appendChild(html);
		block.appendChild(info);
		this.wrapper.appendChild(block);
	}

	onKeyDownSendAndReceived(e) {
		if (e.keyCode == 13) {
			if (e.target.value == '' || this.validateIPaddress(e.target.value)) {
				const hub = e.target.getAttribute('data-hub');
				this.updateFB('/WEBCAMS/' + hub + '/webcam/', e.target.value);
			}
			e.target.blur();
		}
	}

	updateFB(path, data) {
		const updates = {};
		updates[path] = data;
		this.scope.database.ref().update(updates);
	}

	validateIPaddress(ipaddress) {
		if (
			/^http:\/\/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\:[0-9]{1,4}\/$/.test(
				ipaddress
			)
		) {
			return true;
		}
		return false;
	}

	FBListener(path, target) {
		this.scope.database.ref(path).on('value', (snapshot) => {
			const value = snapshot.val();
			target.value = value;
			if (
				target.parentNode.parentNode.getElementsByClassName('title')[0].getElementsByTagName('a').length > 0 &&
				value
			) {
				target.parentNode.parentNode
					.getElementsByClassName('title')[0]
					.getElementsByTagName('a')[0].href = value;
			} else if (value) {
				target.parentNode.parentNode.getElementsByClassName('title')[0].innerHTML =
					'<a href="' + value + '" target="_blank">Webcam</a>';
			} else {
				target.parentNode.parentNode.getElementsByClassName('title')[0].innerHTML = 'No webcam yet.';
			}
		});
	}
}
