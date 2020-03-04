// basic 2D Vector class
class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	set(x, y) {
		if (x instanceof Vector) {
			this.x = x.x || 0;
			this.y = x.y || 0;
			return this;
		}
		this.x = x;
		this.y = y;
		return this;
	}

	copy() {
		return new Vector(this.x, this.y);
	}

	add(x, y) {
		if (x instanceof Vector) {
			this.x += x.x || 0;
			this.y += x.y || 0;
			return this;
		}
		this.x += x;
		this.y += y;
		return this;
	}

	sub(x, y) {
		if (x instanceof Vector) {
			this.x -= x.x || 0;
			this.y -= x.y || 0;
			return this;
		}
		this.x -= x;
		this.y -= y;
		return this;
	}

	mult(n) {
		this.x *= n;
		this.y *= n;
		return this;
	}

	div(n) {
		if (n === 0) {
			console.warn("vector can't be divided by 0");
			return;
		}
		this.x /= n;
		this.y /= n;
		return this;
	}

	mag() {
		return Math.sqrt(this.magSq());
	}

	magSq() {
		const x = this.x;
		const y = this.y;
		return x * x + y * y;
	}

	dot(x, y) {
		return this.x * (x || 0) + this.y * (y || 0);
	}

	cross(v) {
		const z = this.x * v.y - this.y * v.x;
		return new Vector(0, 0, z);
	}

	dist(v) {
		// chained ??
		return v
			.copy()
			.sub(this)
			.mag();
	}

	normalize() {
		const len = this.mag();
		if (len !== 0) this.mult(1 / len);
		return this;
	}

	limit(max) {
		const mSq = this.magSq();
		if (mSq > max * max) {
			this.div(Math.sqrt(mSq)).mult(max);
		}
		return this;
	}

	setMag(n) {
		return this.normalize().mult(n);
	}

	heading() {
		const h = Math.atan2(this.y, this.x);
		return h;
	}

	rotate(a) {
		let newHeading = this.heading() + a;
		const mag = this.mag();
		this.x = Math.cos(newHeading) * mag;
		this.y = Math.sin(newHeading) * mag;
		return this;
	}

	angleBetween(v) {
		const dotmagmag = this.dot(v) / (this.mag() * v.mag());
		// Mathematically speaking: the dotmagmag variable will be between -1 and 1
		// inclusive. Practically though it could be slightly outside this range due
		// to floating-point rounding issues. This can make Math.acos return NaN.
		//
		// Solution: we'll clamp the value to the -1,1 range
		let angle;
		angle = Math.acos(Math.min(1, Math.max(-1, dotmagmag)));
		angle = angle * Math.sign(this.cross(v).z || 1);

		return angle;
	}

	lerp(x, y, amt) {
		this.x += (x - this.x) * amt || 0;
		this.y += (y - this.y) * amt || 0;
		return this;
	}

	array() {
		return [this.x || 0, this.y || 0];
	}

	equals(x, y) {
		let a, b;
		a = x || 0;
		b = y || 0;
		return this.x === a && this.y === b;
	}

	fromAngle(angle, length) {
		if (typeof length === 'undefined') {
			length = 1;
		}
		return new Vector(length * Math.cos(angle), length * Math.sin(angle));
	}

	fromAngles(theta, phi, length) {
		if (typeof length === 'undefined') {
			length = 1;
		}
		const cosPhi = Math.cos(phi);
		const sinPhi = Math.sin(phi);
		const cosTheta = Math.cos(theta);
		const sinTheta = Math.sin(theta);
		return new Vector(length * sinTheta * sinPhi, -length * cosTheta);
	}

	random2D() {
		return this.fromAngle(Math.random() * Utils.TWO_PI);
	}

	// STATIC FUNCTIONS
	static vector_add(v1, v2, target) {
		if (!target) {
			target = v1.copy();
		} else {
			target.set(v1);
		}
		target.add(v2);
		return target;
	}

	static vector_sub(v1, v2, target) {
		if (!target) {
			target = v1.copy();
		} else {
			target.set(v1);
		}
		target.sub(v2);
		return target;
	}

	static vector_mult(v, n, target) {
		if (!target) {
			target = v.copy();
		} else {
			target.set(v);
		}
		target.mult(n);
		return target;
	}

	static vector_div(v, n, target) {
		if (!target) {
			target = v.copy();
		} else {
			target.set(v);
		}
		target.div(n);
		return target;
	}

	static vector_dot(v1, v2) {
		return v1.dot(v2);
	}

	static vector_cross(v1, v2) {
		return v1.cross(v2);
	}

	static vector_dist(v1, v2) {
		return v1.dist(v2);
	}

	static vector_lerp(v1, v2, amt, target) {
		if (!target) {
			target = v1.copy();
		} else {
			target.set(v1);
		}
		target.lerp(v2, amt);
		return target;
	}

	static vector_mag(vecT) {
		const x = vecT.x;
		const y = vecT.y;
		const magSq = x * x + y * y;
		return Math.sqrt(magSq);
	}
}
