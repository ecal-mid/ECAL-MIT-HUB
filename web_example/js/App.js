import Particle from './Particle.js';
import Flowfield from './Flowfield.js';
import Utils from './Utils.js';
export default class App {
	constructor() {
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.w = window.innerWidth;
		this.canvas.height = this.h = window.innerHeight;
		this.ctx = this.canvas.getContext('2d');
		document.body.appendChild(this.canvas);

		this.initFlowfield();
		this.initFB();
		this.draw();
	}

	initFlowfield() {
		this.particles = [];
		this.flowfield = new Flowfield(this.ctx, true);
		for (let i = 0; i < 2000; i++) {
			this.particles.push(new Particle(this.ctx, true));
		}
	}
	initFB() {
		firebase
			.database()
			.ref('HUBS/HUB_MIT/0/message')
			.on('value', (snapshot) => {
				const value = snapshot.val();
				console.log(value);

				try {
					// console.log(value);
					//-> map to 360
					const angle = Utils.map(value, 0, 255, 0, 360);
					this.flowfield.offsetAngle = angle;
				} catch (error) {
					console.log(error);
				}
			});
	}
	draw() {
		this.ctx.clearRect(0, 0, this.w, this.h);
		if (this.particles && this.particles.length > 0) {
			try {
				this.flowfield.update();
				// this.flowfield.draw();
				for (let i = 0; i < this.particles.length; i++) {
					this.particles[i].follow(this.flowfield);
					this.particles[i].update();
					this.particles[i].edges();
					this.particles[i].draw();
				}
			} catch (error) {
				console.log(error);
			}
		}
		requestAnimationFrame(this.draw.bind(this));
	}
}

window.onload = function() {
	new App();
};
