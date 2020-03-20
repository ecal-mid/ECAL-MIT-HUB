import noise from './perlin.js';
import Utils from './Utils.js';

export default class Particle {
	constructor(ctx) {
		this.w = window.innerWidth;
		this.h = window.innerHeight;
		this.center = new Vector((this.w / 3) * 2, this.h / 2);
		this.position = new Vector(Math.random() * this.w, Math.random() * this.h);
		this.velocity = new Vector(0, 0);
		this.acceleration = new Vector(0, 0);
		this.force = new Vector(-1, 0);
		this.maxSpeed = 1 + Math.round(Math.random() * 1);
		this.r = 1;
		this.ctx = ctx;
	}
	setup() {}
	update() {
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed);
		this.position.add(this.velocity);
		this.acceleration.mult(0);
	}
	draw() {
		const angle = this.velocity.heading() + Utils.HALF_PI;
		// this.ctx.globalAlpha = this.r == 2 ? 0.5 : 1;
		// draw triangle oriented with heading
		// const h = ;
		// const s = ;
		// const l = ;
		this.ctx.save();
		this.ctx.translate(this.position.x, this.position.y);
		this.ctx.rotate(angle);
		this.ctx.beginPath();
		// this.ctx.moveTo(0, -this.r * 2);
		// this.ctx.lineTo(-this.r, this.r * 2);
		// this.ctx.lineTo(this.r, this.r * 2);
		// this.ctx.lineTo(0, -this.r * 2);
		this.ctx.arc(0, 0, this.r, 0, Utils.TWO_PI, false);
		this.ctx.fill();
		this.ctx.closePath();
		this.ctx.restore();
	}
	applyForce(force) {
		this.acceleration.add(force);
	}
	edges() {
		if (this.position.x < -this.r) {
			// if (Math.random() > 0.5) {
			this.position.x = this.w + this.r - 1;
			// 	this.force.x = -1;
			// } else {
			// 	this.position.x = -this.r + 1;
			// 	this.force.x = 1;
			// }

			this.position.y = Math.random() * this.h;
		}
		if (this.position.y < -this.r) this.position.y = this.h + this.r - 1;
		if (this.position.x > this.w + this.r) this.position.x = -this.r + 1;
		if (this.position.y > this.h + this.r) this.position.y = -this.r + 1;
	}
	follow(flowField) {
		const x = Math.floor(this.position.x / flowField.scl);
		const y = Math.floor(this.position.y / flowField.scl);
		const index = x + y * flowField.cols;
		if (flowField.vector[index]) {
			this.applyForce(flowField.vector[index]);
		}
	}
	randomize() {
		this.position = new Vector(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
	}
}
