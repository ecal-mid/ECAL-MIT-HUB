import noise from './perlin.js';
import Utils from './Utils.js';
export default class Flowfield {
	constructor(ctx, horizontal) {
		this.w = window.innerWidth;
		this.h = window.innerHeight;
		this.scl = 90;
		this.cols = Math.floor(this.w / this.scl);
		this.rows = Math.floor(this.h / this.scl);
		this.zoff = 0;
		this.inc = 0.05;
		this.vector = [];
		this.offsetAngle = 0;
		this.ctx = ctx;
		for (let y = 0; y < this.rows + 1; y++) {
			for (let x = 0; x < this.cols; x++) {
				this.vector.push(new Vector(0, 0));
			}
		}
	}
	update() {
		// this.zoff = 0;
		let yoff = 0;
		const magn = 30;
		for (let y = 0; y < this.rows + 1; y++) {
			let xoff = 0;
			for (let x = 0; x < this.cols; x++) {
				const index = x + y * this.cols;
				const n = noise(xoff, yoff, this.zoff);
				const angle = n * Utils.PI * 2 + this.offsetAngle * (Utils.PI / 180);
				this.vector[index].set(Math.cos(angle) * magn, Math.sin(angle) * magn);
				xoff += this.inc;
			}
			yoff += this.inc;
			this.zoff += 0.0002;
		}
	}

	draw() {
		for (let y = 0; y < this.rows + 1; y++) {
			for (let x = 0; x < this.cols; x++) {
				const index = x + y * this.cols;
				if (this.vector[index]) {
					this.ctx.save();
					this.ctx.translate(x * this.scl, y * this.scl);
					this.ctx.beginPath();
					this.ctx.moveTo(0, 0);
					this.ctx.lineTo(this.vector[index].x, this.vector[index].y);
					this.ctx.stroke();
					this.ctx.closePath();
					this.ctx.restore();
				}
			}
		}
	}
}
