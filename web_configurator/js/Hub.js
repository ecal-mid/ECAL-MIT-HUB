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
				console.log(this.name, connection.hub_name);
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
}
